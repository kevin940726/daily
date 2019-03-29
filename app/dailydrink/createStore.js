const { submitNewStore } = require('../store');

exports.handleSubmitNewStore = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const { submission, user } = body;

  const storeID = submission.storeName;

  ctx.status = 200;
  ctx.body = null;

  submitNewStore(storeID, {
    ...submission,
    userID: user.id,
    userName: user.name,
  });
};
