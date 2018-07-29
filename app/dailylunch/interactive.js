const { CALLBACK_BUTTON, CALLBACK_DIALOG } = require('../constants');
const button = require('./button');
const { submitDialog } = require('./create');

const interactive = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const { callback_id: callbackID } = body;

  if (callbackID.startsWith(CALLBACK_BUTTON)) {
    return button(ctx);
  } else if (callbackID.startsWith(CALLBACK_DIALOG)) {
    return submitDialog(ctx);
  }
};

module.exports = interactive;
