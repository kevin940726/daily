const { openDialog } = require('../slack');
const DrinkDialog = require('./components/DrinkDialog');
const StoreDialog = require('./components/StoreDialog');
const logger = require('../logger');

exports.create = async ctx => {
  const {
    trigger_id: triggerID,
    user_id: userID,
    user_name: userName,
    response_url: responseURL,
    text,
  } = ctx.request.body;

  logger.log('/slash/dailydrink', {
    userID,
    userName,
    text,
  });

  ctx.ok();

  const state = {
    responseURL,
  };

  if (text.trim() === 'submit') {
    openDialog(triggerID, StoreDialog({}));
  } else {
    openDialog(triggerID, DrinkDialog({ state }));
  }
};
