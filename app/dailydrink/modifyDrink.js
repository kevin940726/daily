const { setDrinkIsClosed } = require('../store');
const updateMessage = require('./updateMessage');
const { DAILYDRINK_OVERFLOW_BLOCK_ID } = require('./constants');

const handleSetDrinkIsClosed = async (ctx, isClosed) => {
  const body = JSON.parse(ctx.request.body.payload);

  const {
    actions: [{ block_id: blockID }],
    user: { id: userID },
    response_url: responseURL,
  } = body;
  const messageID = blockID.replace(DAILYDRINK_OVERFLOW_BLOCK_ID, '').slice(1);

  ctx.status = 200;
  ctx.body = null;

  setDrinkIsClosed(messageID, userID, isClosed).then(() =>
    updateMessage(messageID, responseURL)
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
    default: {
      ctx.status = 200;
      ctx.body = null;
    }
  }
};
