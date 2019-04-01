const { setDrinkIsClosed } = require('../store');
const updateMessage = require('./updateMessage');
const DrinkDialog = require('./components/DrinkDialog');
const { openDialog } = require('../slack');
const { getDrinkOrderData } = require('../store');
const logger = require('../logger');

const handleSetDrinkIsClosed = async (ctx, isClosed) => {
  const { body } = ctx.state;

  const {
    actions: [{ action_id: messageID }],
    user: { id: userID, name: userName },
    response_url: responseURL,
  } = body;

  logger.log('/dailydrink/set-is-closed', {
    messageID,
    userID,
    isClosed,
    userName,
  });

  ctx.ok();

  getDrinkOrderData(messageID).then(messageData => {
    if (messageData.userID !== userID) {
      return ctx.sendWarning(responseURL, 'Permission denied: Owners only.');
    }

    setDrinkIsClosed(messageID, isClosed).then(() =>
      updateMessage(messageID, responseURL)
    );
  });
};

const handleEditDrink = async ctx => {
  const { body } = ctx.state;

  const {
    actions: [{ action_id: messageID }],
    user: { id: userID, name: userName },
    trigger_id: triggerID,
    response_url: responseURL,
  } = body;

  logger.log('/dailydrink/edit-drink', {
    messageID,
    userID,
    userName,
  });

  ctx.ok();

  getDrinkOrderData(messageID).then(messageData => {
    if (messageData.userID !== userID) {
      return ctx.sendError(responseURL, 'Permission denied: Owners only.');
    }

    const state = {
      storeID: messageData.store.storeName,
      responseURL,
      messageID,
    };

    openDialog(
      triggerID,
      DrinkDialog({ isEdit: true, fields: messageData, state })
    );
  });
};

module.exports = async ctx => {
  const { body } = ctx.state;

  const {
    actions: [
      {
        selected_option: { value },
      },
    ],
  } = body;

  switch (value) {
    case 'close-order':
      return handleSetDrinkIsClosed(ctx, true);
    case 'reopen-order':
      return handleSetDrinkIsClosed(ctx, false);
    case 'edit-order':
      return handleEditDrink(ctx);
    default: {
      ctx.ok();
    }
  }
};
