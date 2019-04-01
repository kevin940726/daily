const { submitNewStore } = require('../store');
const logger = require('../logger');

exports.handleSubmitNewStore = async ctx => {
  const { body } = ctx.state;

  const { submission, user } = body;

  const storeID = submission.storeName;

  const payload = {
    ...submission,
    userID: user.id,
    userName: user.name,
  };

  logger.log('/dailydrink/submit-store', {
    ...payload,
  });

  ctx.ok();

  submitNewStore(storeID, payload);
};
