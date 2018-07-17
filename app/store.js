const admin = require('firebase-admin');
const { DAILYLUNCH_MAX_PRICE } = require('./constants');
const { updateChat } = require('./slack');
const { getLunch, buildAttachments, buildCloseAction } = require('./utils');

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

const getDayKey = timestamp => new Date(timestamp).toLocaleDateString('zh-TW');

exports.updateMessage = async messageID => {
  const [messageDoc, messageLunch] = await Promise.all([
    messagesCollection.doc(messageID).get(),
    exports.getMessageLunch(messageID),
  ]);

  const messageData = messageDoc.data();
  const isClosed = messageData.isClosed;

  const isDailylunch = messageData.isDailylunch;

  const exceedUsers = {};

  if (isDailylunch) {
    const dayKey = getDayKey(messageData.createTimestamp);
    const dailylunchRef = dailylunchCollection.doc(dayKey);
    const dailylunchExceedUsers = await dailylunchRef
      .collection('users')
      .where('totalPrice', '>', DAILYLUNCH_MAX_PRICE)
      .get();

    dailylunchExceedUsers.forEach(userDoc => {
      exceedUsers[userDoc.id] = true;
    });
  }

  const lunchOrder = messageData.lunch;
  const nextLunchList = lunchOrder.map(launchID => messageLunch[launchID]);
  const lunches = getLunch(nextLunchList, exceedUsers);

  const attachments = buildAttachments(lunches).concat(
    buildCloseAction(messageID, isClosed)
  );

  return updateChat(
    {
      ts: messageData.messageTS,
      channel: messageData.channelID,
    },
    {
      attachments,
    }
  );
};

exports.createLunch = async (
  messageID,
  { lunch, userID, isDailylunch, channelID }
) => {
  const batch = db.batch();
  const messageRef = messagesCollection.doc(messageID);
  const createTimestamp = Date.now();

  batch.set(messageRef, {
    messageID,
    userID,
    isClosed: false,
    isDailylunch,
    createTimestamp,
    channelID,
    lunch: lunch.map(l => l.lunchID),
  });

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
    batch.set(lunchCollection.doc(l.lunchID), {
      lunchID: l.lunchID,
      messageID,
      createTimestamp,
      isDailylunch,
      name: l.name,
      price: l.price,
      users: {},
    });
  });

  return batch.commit();
};

exports.orderLunch = async (lunchID, { userID, action }) => {
  const lunchRef = lunchCollection.doc(lunchID);

  return db.runTransaction(async t => {
    const doc = await t.get(lunchRef);
    const delta = action === 'minus' ? -1 : 1;
    const updateTimestamp = admin.firestore.FieldValue.serverTimestamp();
    const lunchData = doc.data();
    const userObj = lunchData.users[userID];

    let messagesShouldUpdate = [lunchData.messageID];

    if (lunchData.isDailylunch) {
      const createTimestamp = lunchData.createTimestamp;
      const dayKey = getDayKey(createTimestamp);
      const dailylunchRef = dailylunchCollection.doc(dayKey);
      const dailylunchData = (await dailylunchRef.get()).data();
      const dailylunchUsersCollection = dailylunchRef.collection('users');
      const dailylunchUserRef = dailylunchUsersCollection.doc(userID);
      const dailylunchUserSnapshot = await dailylunchUserRef.get();

      const currentPrice =
        (dailylunchUserSnapshot.exists &&
          dailylunchUserSnapshot.get('totalPrice')) ||
        0;
      const totalPrice = currentPrice + delta * lunchData.price;

      if (dailylunchUserSnapshot.exists) {
        await t.update(dailylunchUserRef, {
          totalPrice,
        });
      } else {
        await t.set(dailylunchUserRef, {
          totalPrice,
        });
      }

      messagesShouldUpdate = Object.keys(dailylunchData.messages);
    }

    const count = (userObj && userObj.count) || 0;
    const nextCount = Math.max(count + delta, 0);

    if (!userObj) {
      await t.update(lunchRef, {
        [`users.${userID}`]: {
          userID,
          count: nextCount,
          createTimestamp: updateTimestamp,
          updateTimestamp,
        },
      });
    }

    await t.update(lunchRef, {
      [`users.${userID}.count`]: nextCount,
      [`users.${userID}.updateTimestamp`]: admin.firestore.FieldValue.serverTimestamp(),
    });

    return messagesShouldUpdate;
  });
};

exports.getMessageLunch = async messageID => {
  const messageLunchSnapshot = await lunchCollection
    .where('messageID', '==', messageID)
    .get();

  const messageLunch = {};
  messageLunchSnapshot.forEach(doc => {
    messageLunch[doc.id] = doc.data();
  });

  return messageLunch;
};

exports.setMessageClose = async (messageID, isClosed) => {
  return messagesCollection.doc(messageID).update({
    isClosed,
  });
};

exports.getMessageIsClosed = async messageID => {
  const messageDoc = await messagesCollection.doc(messageID).get();

  return !!messageDoc.data().isClosed;
};

exports.updateMessageTS = async (messageID, messageTS) => {
  const messageRef = messagesCollection.doc(messageID);
  const messageDoc = await messageRef.get();
  const messageData = messageDoc.data();

  if (!messageData.messageTS) {
    return messageRef.update({
      messageTS,
    });
  }
};
