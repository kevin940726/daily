const admin = require('firebase-admin');
const { DAILYLUNCH_MAX_PRICE, CLOSE_USER_WHITE_LIST } = require('./constants');
const { updateChat } = require('./slack');
const {
  getLunch,
  buildAttachments,
  buildCloseAction,
  getDayKey,
} = require('./utils');

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Lunch {
 *   [lunchID]: {
 *     lunchID: string,
 *     messageID: string,
 *     isClosed: boolean,
 *     userID: string,
 *
 *     users: Users {
 *       [userID]: timestamp
 *     },
 *
 *     orders: Orders {
 *       [userID]: {
 *         userID: string,
 *         count: number,
 *         updateTimestamp: timestamp
 *       }
 *     }
 *
 *     orders: Orders {
 *        [userID]: {
 *          userID: string,
 *          count: number,
 *          updateTimestamp: timestamp
 *       }
 *     }
 *   }
 * }
 */
const db = admin.firestore();

const lunchCollection = db.collection('lunch');
const messagesCollection = db.collection('messages');
const dailylunchCollection = db.collection('dailylunch');

const updateQueue = new Map();

const createMessageUpdater = messageID => async () => {
  const [messageDoc, messageLunch] = await Promise.all([
    messagesCollection.doc(messageID).get(),
    exports.getMessageLunch(messageID),
  ]);

  const messageData = messageDoc.data();
  const isClosed = messageData.isClosed;

  const lunchOrder = messageData.lunch;
  const nextLunchList = lunchOrder.map(launchID =>
    messageLunch.find(lunch => lunch.lunchID === launchID)
  );
  const lunches = getLunch(nextLunchList);

  const attachments = buildAttachments(lunches, { isClosed }).concat(
    buildCloseAction(messageID, isClosed)
  );

  return updateChat(
    {
      ts: messageData.messageTS,
      channel: messageData.channelID,
    },
    {
      text: messageData.title,
      attachments,
    }
  );
};

exports.updateMessage = async messageID => {
  updateQueue.set(
    messageID,
    (updateQueue.get(messageID) || Promise.resolve()).then(
      createMessageUpdater(messageID)
    )
  );

  return updateQueue.get(messageID);
};

exports.createLunch = async (
  messageID,
  { lunch, title, userID, userName, isDailylunch, channelID, messageTS }
) => {
  const batch = db.batch();
  const messageRef = messagesCollection.doc(messageID);
  const createTimestamp = Date.now();

  const messageData = {
    messageID,
    userID,
    userName,
    isClosed: false,
    title,
    isDailylunch,
    createTimestamp,
    channelID,
    messageTS,
    lunch: lunch.map(l => l.lunchID),
  };

  batch.set(messageRef, messageData);

  if (isDailylunch) {
    const dayKey = getDayKey(createTimestamp);
    const dailylunchRef = dailylunchCollection.doc(dayKey);
    const dailylunchDoc = await dailylunchRef.get();

    if (!dailylunchDoc.exists) {
      batch.set(dailylunchRef, {
        day: dayKey,
        messages: {
          [messageID]: createTimestamp,
        },
      });
    } else {
      batch.update(dailylunchRef, {
        [`messages.${messageID}`]: createTimestamp,
      });
    }
  }

  lunch.forEach(l => {
    const lunchData = {
      lunchID: l.lunchID,
      messageID,
      createTimestamp,
      isDailylunch,
      name: l.name,
      price: l.price,
    };

    batch.set(lunchCollection.doc(l.lunchID), lunchData);
  });

  return batch.commit();
};

exports.orderLunch = async (lunchID, { userID, userName, action }) => {
  const lunchRef = lunchCollection.doc(lunchID);
  const userRef = lunchRef.collection('users').doc(userID);

  return db.runTransaction(async t => {
    const doc = await t.get(lunchRef);
    const delta = action === 'minus' ? -1 : 1;
    const updateTimestamp = admin.firestore.FieldValue.serverTimestamp();
    const lunchData = doc.data();
    const userDoc = await userRef.get();
    const userData = userDoc.exists && userDoc.data();

    const count = (userData && userData.count) || 0;
    const nextCount = Math.max(count + delta, 0);
    const deltaPrice = (nextCount - count) * lunchData.price;

    if (lunchData.isDailylunch) {
      const createTimestamp = lunchData.createTimestamp;
      const dayKey = getDayKey(createTimestamp);
      const dailylunchRef = dailylunchCollection.doc(dayKey);
      const dailylunchUsersCollection = dailylunchRef.collection('users');
      const dailylunchUserRef = dailylunchUsersCollection.doc(userID);
      const dailylunchUserSnapshot = await dailylunchUserRef.get();

      const currentPrice =
        (dailylunchUserSnapshot.exists &&
          dailylunchUserSnapshot.get('totalPrice')) ||
        0;
      const totalPrice = Math.max(currentPrice + deltaPrice, 0);

      if (
        totalPrice > DAILYLUNCH_MAX_PRICE &&
        // admin users can still order
        !CLOSE_USER_WHITE_LIST.includes(userID)
      ) {
        return false;
      }

      if (dailylunchUserSnapshot.exists) {
        await t.update(dailylunchUserRef, {
          totalPrice,
        });
      } else {
        await t.set(dailylunchUserRef, {
          totalPrice,
          userName,
        });
      }
    }

    if (!userData) {
      await t.set(userRef, {
        userID,
        userName,
        count: nextCount,
        createTimestamp: updateTimestamp,
        updateTimestamp,
      });
    } else {
      await t.update(userRef, {
        count: nextCount,
        updateTimestamp,
      });
    }

    return true;
  });
};

exports.getMessageLunch = async messageID => {
  const messageLunchSnapshot = await lunchCollection
    .where('messageID', '==', messageID)
    .get();

  const messageLunch = [];
  messageLunchSnapshot.forEach(doc => {
    messageLunch.push(doc);
  });

  return Promise.all(
    messageLunch.map(async doc => {
      const usersSnapshot = await doc.ref.collection('users').get();

      const users = {};

      usersSnapshot.forEach(userDoc => {
        users[userDoc.id] = userDoc.data();
      });

      return {
        ...doc.data(),
        users,
      };
    })
  );
};

exports.setMessageClose = async (messageID, isClosed) => {
  return messagesCollection.doc(messageID).update({
    isClosed,
  });
};

exports.getMessageIsClosed = async messageID => {
  const messageDoc = await messagesCollection.doc(messageID).get();

  return !!(messageDoc.exists && messageDoc.data().isClosed);
};

exports.getMessageCreatorID = async messageID => {
  const messageDoc = await messagesCollection.doc(messageID).get();

  return messageDoc.exists && messageDoc.data().userID;
};
