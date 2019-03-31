const { setDrinkIsClosed } = require('../store');
const updateMessage = require('./updateMessage');
const DrinkDialog = require('./components/DrinkDialog');
const { openDialog } = require('../slack');
const { getDrinkOrderData } = require('../store');

const handleSetDrinkIsClosed = async (ctx, isClosed) => {
  const { body } = ctx.state;

  const {
    actions: [{ action_id: messageID }],
    user: { id: userID },
    response_url: responseURL,
  } = body;

  ctx.ok();

  setDrinkIsClosed(messageID, userID, isClosed).then(() =>
    updateMessage(messageID, responseURL)
  );
};

const handleEditDrink = async ctx => {
  const { body } = ctx.state;

  const {
    actions: [{ action_id: messageID }],
    user: { id: userID },
    trigger_id: triggerID,
    response_url: responseURL,
  } = body;

  ctx.ok();

  const messageData = await getDrinkOrderData(messageID);

  if (messageData.userID !== userID) {
    return ctx.sendError(responseURL, 'Permission denied: Owners only.');
  }

  const state = {
    storeID: messageData.store.storeName,
    messageID,
  };

  openDialog(
    triggerID,
    DrinkDialog({ isEdit: true, fields: messageData, state })
  );
};

module.exports = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

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
