const { getStoreData, setDrinkOrder } = require('../store');
const updateMessage = require('./updateMessage');
const { CHOOSE_STORE_SELECT } = require('./constants');
const { nanoID } = require('../utils');
const logger = require('../logger');

exports.handlePostToChannel = async ctx => {
  const { body } = ctx.state;

  const { submission, state, channel, user } = body;

  const { messageID = nanoID(), responseURL } = JSON.parse(state);

  const { title } = submission;
  const storeID = submission[CHOOSE_STORE_SELECT];

  logger.log('/dailydrink/update', {
    ...submission,
    messageID,
    userID: user.id,
    userName: user.name,
  });

  ctx.ok();

  getStoreData(storeID).then(store => {
    if (!store) {
      return ctx.sendError(responseURL, 'Store not found');
    }

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
  });
};
