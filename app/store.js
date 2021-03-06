const admin = require('firebase-admin');
const {
  DAILYLUNCH_MAX_PRICE,
  CLOSE_USER_WHITE_LIST,
  SLACK_ENV,
  ERROR_EXCEED_LIMIT,
  ERROR_EXCEED_PRICE,
} = require('./constants');
const { respondMessage } = require('./slack');
const {
  getLunch,
  buildAttachments,
  buildCloseAction,
  getDayKey,
  boldTitle,
} = require('./utils');

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

const envDoc = db.collection('env').doc(SLACK_ENV);
const messagesCollection = envDoc.collection('messages');
const dailylunchCollection = envDoc.collection('dailylunch');
const storesCollection = envDoc.collection('stores');
const dailydrinkCollection = envDoc.collection('dailydrink');

const updateQueue = new Map();

const createMessageUpdater = (messageID, responseURL) => async () => {
  const messageData = await exports.getMessageData(messageID);

  const isClosed = messageData.isClosed;

  const lunchList = getLunch(
    Object.values(messageData.lunch).sort((a, b) => a.index - b.index)
  );

  const attachments = buildAttachments(lunchList, { isClosed }).concat(
    buildCloseAction(messageID, isClosed)
  );

  return respondMessage(responseURL, {
    text: boldTitle(messageData.title),
    attachments,
  });
};

exports.updateMessage = async (messageID, responseURL) => {
  updateQueue.set(
    messageID,
    (updateQueue.get(messageID) || Promise.resolve()).then(
      createMessageUpdater(messageID, responseURL)
    )
  );

  return updateQueue.get(messageID);
};

exports.createLunch = async (
  messageID,
  { lunch, title, userID, userName, isDailylunch, channelID }
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

  return db.runTransaction(async t => {
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
  });
};

exports.getMessageData = async messageID => {
  const messageSnapshot = await messagesCollection.doc(messageID).get();

  if (!messageSnapshot.exists) {
    return null;
  }

  const messageData = messageSnapshot.data();

  return messageData;
};

exports.setMessageClose = async (messageID, isClosed) => {
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

/**
 * dailydrink
 */

// storeID is equal to storeName for simplicity
exports.submitNewStore = async (
  storeID,
  { storeName, imageURL, userID, userName }
) => {
  const storesRef = storesCollection.doc('stores');

  const storesSnapshot = await storesRef.get();

  if (!storesSnapshot.exists) {
    await storesRef.set({});
  }

  return storesRef.update({
    [storeID]: {
      storeName,
      imageURL,
      userID,
      userName,
    },
  });
};

exports.getAllStores = async () => {
  const storesSnapshot = await storesCollection.doc('stores').get();

  if (!storesSnapshot.exists) {
    return [];
  }

  const storesData = storesSnapshot.data();

  return Object.keys(storesData);
};

exports.getStoreData = async storeID => {
  const storesSnapshot = await storesCollection.doc('stores').get();

  if (!storesSnapshot.exists) {
    return [];
  }

  const storesData = storesSnapshot.data();

  return storesData[storeID];
};

exports.setDrinkOrder = async (
  messageID,
  { channelID, title, userID, userName, store }
) => {
  const messageRef = dailydrinkCollection.doc(messageID);
  const updateTimestamp = Date.now();

  const messageSnapshot = await messageRef.get();

  const payload = {
    title,
    store,
    updateTimestamp,
  };

  if (!messageSnapshot.exists) {
    return messageRef.set({
      ...payload,
      messageID,
      channelID,
      userID,
      userName,
      isClosed: false,
      orders: {},
    });
  }

  return messageRef.update(payload);
};

exports.setOrder = async (
  orderID,
  {
    messageID,
    orderName,
    size,
    ice,
    sugar,
    ingredients,
    price,
    userID,
    userName,
  }
) => {
  const messageRef = dailydrinkCollection.doc(messageID);
  const updateTimestamp = Date.now();

  return messageRef.update({
    [`orders.${orderID}`]: {
      orderID,
      orderName,
      size,
      ice,
      sugar,
      ingredients,
      price,
      userID,
      userName,
      updateTimestamp,
    },
  });
};

exports.getDrinkOrderData = async messageID => {
  const messageSnapshot = await dailydrinkCollection.doc(messageID).get();

  if (!messageSnapshot.exists) {
    return null;
  }

  const messageData = messageSnapshot.data();

  return messageData;
};

exports.removeOrder = async (orderID, messageID) => {
  const messageRef = dailydrinkCollection.doc(messageID);
  const messageData = await exports.getDrinkOrderData(messageID);
  const orderData = messageData.orders[orderID];

  if (!orderData) {
    return;
  }

  return messageRef.update({
    [`orders.${orderID}`]: FieldValue.delete(),
  });
};

exports.setDrinkIsClosed = async (messageID, isClosed) => {
  const messageRef = dailydrinkCollection.doc(messageID);

  return messageRef.update({
    isClosed,
  });
};
