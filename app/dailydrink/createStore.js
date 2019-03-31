const { submitNewStore } = require('../store');

exports.handleSubmitNewStore = async ctx => {
  const { body } = ctx.state;

  const { submission, user } = body;

  const storeID = submission.storeName;

  ctx.ok();

  submitNewStore(storeID, {
    ...submission,
    userID: user.id,
    userName: user.name,
  });
};
