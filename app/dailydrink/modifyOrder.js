const { removeOrder, getDrinkOrderData } = require('../store');
const OrderDialog = require('./components/OrderDialog');
const { openDialog } = require('../slack');
const updateMessage = require('./updateMessage');
const { ORDER_OVERFLOW_BLOCK_ID } = require('./constants');
const logger = require('../logger');

const handleRemoveOrder = async ctx => {
  const { body } = ctx.state;

  const {
    actions: [{ action_id: messageID, block_id: blockID }],
    user: { id: userID, name: userName },
    response_url: responseURL,
  } = body;
  const orderID = blockID.replace(ORDER_OVERFLOW_BLOCK_ID, '').slice(1);

  logger.log('/dailydrink/remove-order', {
    messageID,
    orderID,
    userID,
    userName,
  });

  ctx.ok();

  getDrinkOrderData(messageID).then(messageData => {
    if (messageData.orders[orderID].userID !== userID) {
      return ctx.sendWarning(responseURL, 'Permission denied: Owners only.');
    }

    return removeOrder(orderID, messageID).then(() =>
      updateMessage(messageID, responseURL)
    );
  });
};

const handleEditOrder = async ctx => {
  const { body } = ctx.state;

  const {
    actions: [{ action_id: messageID, block_id: blockID }],
    user: { id: userID },
    trigger_id: triggerID,
    response_url: responseURL,
  } = body;
  const orderID = blockID.replace(ORDER_OVERFLOW_BLOCK_ID, '').slice(1);

  ctx.ok();

  getDrinkOrderData(messageID).then(messageData => {
    const orderData = messageData.orders[orderID];

    if (orderData.userID !== userID) {
      return ctx.sendWarning(responseURL, 'Permission denied: Owners only.');
    }

    const state = {
      responseURL,
      messageID,
      orderID,
    };

    openDialog(
      triggerID,
      OrderDialog({
        state,
        fields: orderData,
        isEdit: true,
      })
    );
  });
};

module.exports = async ctx => {
  const { body } = ctx.state;

  const { actions } = body;

  switch (actions[0].selected_option.value) {
    case 'remove-order':
      return handleRemoveOrder(ctx);
    case 'edit-order':
      return handleEditOrder(ctx);
    default: {
      ctx.ok();
    }
  }
};
