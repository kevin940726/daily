const admin = require('firebase-admin');

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

exports.createLunch = async (messageID, { lunch, userID }) => {
  const batch = db.batch();
  const messageRef = messagesCollection.doc(messageID);

  batch.set(messageRef, {
    messageID,
    userID,
    isClosed: false,
    lunch: lunch.map(l => l.lunchID),
  });

  lunch.forEach(l => {
    batch.set(lunchCollection.doc(l.lunchID), {
      lunchID: l.lunchID,
      messageID,
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

    if (!userObj) {
      return t.update(lunchRef, {
        [`users.${userID}`]: {
          userID,
          count: Math.max(0 + delta, 0),
          updateTimestamp,
        },
      });
    }

    const count = userObj.count || 0;

    return t.update(lunchRef, {
      [`users.${userID}.count`]: Math.max(count + delta, 0),
      [`users.${userID}.updateTimestamp`]: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
};

exports.getMessageLunch = async messageID => {
  const messageLunchSnapshot = await lunchCollection
    .where('messageID', '==', messageID)
    .get();

  const messageLunchList = [];
  messageLunchSnapshot.forEach(doc => {
    messageLunchList.push(doc.data());
  });

  return messageLunchList;
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
