const CreateDrink = require('./components/CreateDrink');
const logger = require('../logger');

exports.create = async ctx => {
  const {
    trigger_id: triggerID,
    user_id: userID,
    user_name: userName,
    text,
  } = ctx.request.body;

  logger.log('/slash/dailydrink', {
    userID,
    userName,
    triggerID,
    text,
  });

  ctx.status = 200;
  ctx.body = {
    response_type: 'ephemeral',
    blocks: CreateDrink(),
  };
};
