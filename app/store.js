const admin = require('firebase-admin');
const {
  DAILYLUNCH_MAX_PRICE,
  CLOSE_USER_WHITE_LIST,
  SLACK_ENV,
  ERROR_EXCEED_LIMIT,
  ERROR_EXCEED_PRICE,
} = require('./constants');
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

const envDoc = db.collection('env').doc(SLACK_ENV);
const messagesCollection = envDoc.collection('messages');
const dailylunchCollection = envDoc.collection('dailylunch');

const updateQueue = new Map();
const messagesCache = new Map();

const createMessageUpdater = messageID => async () => {
  const messageData = await exports.getMessageData(messageID);

  const isClosed = messageData.isClosed;

  const lunchList = getLunch(
    Object.values(messageData.lunch).sort((a, b) => a.index - b.index)
  );

  const attachments = buildAttachments(lunchList, { isClosed }).concat(
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
    lunch: lunch.reduce(
      (map, l, index) => ({
        ...map,
        [l.lunchID]: {
          lunchID: l.lunchID,
          index,
          messageID,
          createTimestamp,
          isDailylunch,
          name: l.name,
          price: l.price,
          limit: l.limit,
          orders: {},
        },
      }),
      {}
    ),
  };

  batch.set(messageRef, messageData);

  if (isDailylunch) {
    const dayKey = getDayKey(createTimestamp);
    const dailylunchRef = dailylunchCollection.doc(dayKey);
    const dailylunchSnapshot = await dailylunchRef.get();

    if (!dailylunchSnapshot.exists) {
      batch.set(dailylunchRef, {
        day: dayKey,
        messages: {
          [messageID]: createTimestamp,
        },
        users: {},
      });
    } else {
      batch.update(dailylunchRef, {
        [`messages.${messageID}`]: createTimestamp,
      });
    }
  }

  return batch.commit();
};

exports.orderLunch = async (
  messageID,
  { lunchID, userID, userName, action }
) => {
  const messageRef = messagesCollection.doc(messageID);

  return db
    .runTransaction(async t => {
      const messageSnapshot = await t.get(messageRef);
      const messageData = messageSnapshot.data();
      const delta = action === 'minus' ? -1 : 1;
      const updateTimestamp = admin.firestore.FieldValue.serverTimestamp();

      const lunchData = messageData.lunch[lunchID];
      const userData = lunchData.orders[userID];
      const totalCount = Object.values(lunchData.orders).reduce(
        (sum, order) => sum + order.count,
        0
      );

      // exceed the lunch limit, 0 means no limit
      if (lunchData.limit && delta === 1 && totalCount >= lunchData.limit) {
        return Promise.reject(ERROR_EXCEED_LIMIT);
      }

      const count = (userData && userData.count) || 0;
      const nextCount = Math.max(count + delta, 0);
      const deltaPrice = (nextCount - count) * lunchData.price;

      if (lunchData.isDailylunch) {
        const createTimestamp = lunchData.createTimestamp;
        const dayKey = getDayKey(createTimestamp);
        const dailylunchSnapshot = await dailylunchCollection.doc(dayKey).get();
        const dailylunchData =
          dailylunchSnapshot.exists && dailylunchSnapshot.data();

        const userData = dailylunchData && dailylunchData.users[userID];

        const currentPrice = (userData && userData.totalPrice) || 0;
        const totalPrice = Math.max(currentPrice + deltaPrice, 0);

        if (
          totalPrice > DAILYLUNCH_MAX_PRICE &&
          // admin users can still order
          !CLOSE_USER_WHITE_LIST.includes(userID)
        ) {
          return Promise.reject(ERROR_EXCEED_PRICE);
        }

        await t.update(dailylunchSnapshot.ref, {
          [`users.${userID}`]: {
            userID,
            userName,
            totalPrice,
          },
        });
      }

      await t.update(messageRef, {
        [`lunch.${lunchID}.orders.${userID}`]: {
          userID,
          userName,
          count: nextCount,
          updateTimestamp,
        },
      });

      return true;
    })
    .then(() => {
      messagesCache.delete(messageID);
    });
};

exports.getMessageData = async messageID => {
  if (messagesCache.has(messageID)) {
    return messagesCache.get(messageID);
  }

  const messageSnapshot = await messagesCollection.doc(messageID).get();

  if (!messageSnapshot.exists) {
    messagesCache.delete(messageID);
    return null;
  }

  const messageData = messageSnapshot.data();

  messagesCache.set(messageID, messageData);

  return messageData;
};

exports.setMessageClose = async (messageID, isClosed) => {
  messagesCache.delete(messageID);

  return messagesCollection.doc(messageID).update({
    isClosed,
  });
};

exports.getMessageIsClosed = async messageID => {
  const messageData = await exports.getMessageData(messageID);

  return !!(messageData && messageData.isClosed);
};

exports.getMessageCreatorID = async messageID => {
  const messageData = await exports.getMessageData(messageID);

  return messageData && messageData.userID;
};
