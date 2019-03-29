const { CHOOSE_STORE_SELECT } = require('../dailydrink/constants');
const dailydrinkOptions = require('../dailydrink/options');

const options = async ctx => {
  const { body } = ctx.state;

  const { action_id: actionID } = body;

  switch (actionID) {
    case CHOOSE_STORE_SELECT:
      return dailydrinkOptions(ctx);
    default: {
      ctx.status = 200;
      ctx.body = null;
    }
  }
};

module.exports = options;
