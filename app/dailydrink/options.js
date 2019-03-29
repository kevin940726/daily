const { getAllStores } = require('../store');
const { CHOOSE_STORE_SELECT } = require('./constants');

const options = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const { action_id: actionID } = body;

  if (actionID === CHOOSE_STORE_SELECT) {
    const stores = await getAllStores();

    ctx.status = 200;
    ctx.set('Content-Type', 'application/json');

    ctx.body = JSON.stringify({
      options: stores.map(store => ({
        text: {
          type: 'plain_text',
          emoji: true,
          text: store,
        },
        value: store,
      })),
    });
  }
};

module.exports = options;
