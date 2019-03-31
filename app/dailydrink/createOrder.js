const { setOrder } = require('../store');
const { openDialog } = require('../slack');
const OrderDialog = require('./components/OrderDialog');
const updateMessage = require('./updateMessage');
const { ORDER_DRINK_BLOCK_ID } = require('./constants');
const { nanoID } = require('../utils');

exports.handleOrderDrink = async ctx => {
  const { body } = ctx.state;

  const {
    trigger_id: triggerID,
    response_url: responseURL,
    container,
    actions,
  } = body;

  const blockID = actions[0].block_id;
  const messageID = blockID.replace(ORDER_DRINK_BLOCK_ID, '').slice(1);

  const state = {
    originalMessage: container,
    responseURL,
    messageID,
  };

  ctx.ok();

  openDialog(triggerID, OrderDialog({ state }));
};

exports.appendOrder = async ctx => {
  const { body } = ctx.state;

  const { submission, state, user } = body;

  const { responseURL, messageID, orderID = nanoID() } = JSON.parse(state);

  ctx.ok();

  const { price, ...orderData } = submission;

  setOrder(orderID, {
    messageID,
    ...orderData,
    price: parseFloat(price) || 0,
    userID: user.id,
    userName: user.name,
  }).then(() => updateMessage(messageID, responseURL));
};
