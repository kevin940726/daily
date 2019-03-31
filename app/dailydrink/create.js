const { openDialog } = require('../slack');
const DrinkDialog = require('./components/DrinkDialog');
const StoreDialog = require('./components/StoreDialog');
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

  ctx.ok();

  if (text.trim() === 'submit') {
    openDialog(triggerID, StoreDialog({}));
  } else {
    openDialog(triggerID, DrinkDialog({}));
  }
};
