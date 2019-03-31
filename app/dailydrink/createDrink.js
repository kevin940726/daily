const { getStoreData, setDrinkOrder } = require('../store');
const updateMessage = require('./updateMessage');
const { CHOOSE_STORE_SELECT } = require('./constants');
const { nanoID } = require('../utils');

exports.handlePostToChannel = async ctx => {
  const { body } = ctx.state;

  const { submission, response_url: responseURL, state, channel, user } = body;

  const { messageID = nanoID() } = JSON.parse(state);

  const { title } = submission;
  const storeID = submission[CHOOSE_STORE_SELECT];

  const store = await getStoreData(storeID);

  if (!store) {
    return ctx.sendError(responseURL, 'Store not found');
  }

  ctx.ok();

  const payload = {
    title,
    store,
    channelID: channel.id,
    userName: user.name,
    userID: user.id,
  };

  setDrinkOrder(messageID, payload).then(() =>
    updateMessage(messageID, responseURL)
  );
};
