const { CALLBACK_BUTTON, CALLBACK_DIALOG } = require('../constants');
const button = require('../dailylunch/button');
const { submitDialog } = require('../dailylunch/create');
const { handleOrderDrink, appendOrder } = require('../dailydrink/createOrder');
const {
  handleCreateNewOrder,
  handlePostToChannel,
} = require('../dailydrink/createDrink');
const { handleSubmitNewStore } = require('../dailydrink/createStore');
const handleModifyOrder = require('../dailydrink/modifyOrder');
const handleModifyDrink = require('../dailydrink/modifyDrink');
const {
  CREATE_NEW_ORDER_CALLBACK_ID,
  CHOOSE_STORE_ID,
  ORDER_DRINK_BLOCK_ID,
  ORDER_DRINK_DIALOG_CALLBACK_ID,
  CREATE_NEW_STORE_CALLBACK_ID,
  ORDER_OVERFLOW_BLOCK_ID,
  DAILYDRINK_OVERFLOW_BLOCK_ID,
} = require('../dailydrink/constants');

const interactive = async ctx => {
  const { body } = ctx.state;

  const { callback_id: callbackID, actions } = body;

  if (callbackID) {
    if (callbackID.startsWith(CALLBACK_BUTTON)) {
      return button(ctx);
    } else if (callbackID.startsWith(CALLBACK_DIALOG)) {
      return submitDialog(ctx);
    } else if (callbackID === CREATE_NEW_ORDER_CALLBACK_ID) {
      return handlePostToChannel(ctx);
    } else if (callbackID === ORDER_DRINK_DIALOG_CALLBACK_ID) {
      return appendOrder(ctx);
    } else if (callbackID === CREATE_NEW_STORE_CALLBACK_ID) {
      return handleSubmitNewStore(ctx);
    }
  }

  if (actions.length) {
    const blockID = actions[0].block_id;

    if (blockID === CHOOSE_STORE_ID) {
      return handleCreateNewOrder(ctx);
    } else if (blockID.startsWith(ORDER_DRINK_BLOCK_ID)) {
      return handleOrderDrink(ctx);
    } else if (blockID.startsWith(ORDER_OVERFLOW_BLOCK_ID)) {
      return handleModifyOrder(ctx);
    } else if (blockID.startsWith(DAILYDRINK_OVERFLOW_BLOCK_ID)) {
      return handleModifyDrink(ctx);
    }
  }
};

module.exports = interactive;
