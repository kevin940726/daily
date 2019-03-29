const StoreDialog = require('./components/StoreDialog');
const DrinkDialog = require('./components/DrinkDialog');
const Drink = require('./components/Drink');
const { openDialog, respondMessage, deleteMessage } = require('../slack');
const { getStoreData, createDrinkOrder } = require('../store');
const {
  CHOOSE_STORE_ID,
  CHOOSE_STORE_SELECT,
  CHOOSE_STORE_BUTTON,
} = require('./constants');
const { nanoID } = require('../utils');

exports.handleCreateNewOrder = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const { trigger_id: triggerID, actions, container } = body;

  if (!actions.length || actions[0].block_id !== CHOOSE_STORE_ID) {
    return;
  }

  const actionID = actions[0].action_id;

  if (actionID === CHOOSE_STORE_SELECT) {
    const selectedStoreID = actions[0].selected_option.value;

    const state = {
      storeID: selectedStoreID,
      originalMessage: container,
    };

    ctx.status = 200;
    ctx.body = null;

    openDialog(triggerID, DrinkDialog({ state }));
  } else if (actionID === CHOOSE_STORE_BUTTON) {
    ctx.status = 200;
    ctx.body = null;

    openDialog(triggerID, StoreDialog());
  }
};

exports.handlePostToChannel = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const { submission, response_url: responseURL, state, channel, user } = body;

  const { storeID, originalMessage } = JSON.parse(state);

  const { title } = submission;

  const store = await getStoreData(storeID);

  if (!store) {
    ctx.status = 404;
    ctx.body = null;

    return;
  }

  ctx.status = 200;
  ctx.body = null;

  const messageID = nanoID();

  const payload = {
    title,
    store,
    channelID: channel.id,
    userName: user.name,
    userID: user.id,
  };

  respondMessage(responseURL, {
    response_type: 'in_channel',
    blocks: Drink({ messageID, ...payload }),
  }).then(response => {
    if (response && response.ok) {
      return createDrinkOrder(messageID, payload);
    }
  });

  deleteMessage(originalMessage.channel_id, originalMessage.message_ts);
};
