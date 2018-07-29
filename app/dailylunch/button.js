const logger = require('../logger');
const {
  orderLunch,
  getMessageIsClosed,
  setMessageClose,
  updateMessage,
} = require('../store');
const { respondMessage } = require('../slack');
const {
  CLOSE_ACTION,
  CLOSE_USER_WHITE_LIST,
  CALLBACK_BUTTON,
} = require('../constants');

const handleCloseAction = async (
  ctx,
  { closeAction, userID, responseURL, messageID, isClosed }
) => {
  const closeUserWhiteList = CLOSE_USER_WHITE_LIST.concat(
    closeAction.actions[0].value
  );

  if (!closeUserWhiteList.includes(userID)) {
    logger.error('Authorized staffs only!');

    ctx.status = 200;
    ctx.body = '';

    respondMessage(responseURL, {
      response_type: 'ephemeral',
      replace_original: false,
      text: '❎  Authorized staffs only!',
      color: 'danger',
    });

    return;
  }

  await setMessageClose(messageID, !isClosed);

  ctx.status = 200;
  ctx.body = null;

  updateMessage(messageID);
};

const button = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const {
    actions: [{ value: action }],
    callback_id: callbackID,
    user: { id: userID },
    original_message: originalMessage,
    response_url: responseURL,
  } = body;

  const closeAction = originalMessage.attachments.find(
    attachment =>
      attachment.actions &&
      attachment.actions.find(act => act.value === CLOSE_ACTION)
  );

  const lunchID = callbackID.replace(`${CALLBACK_BUTTON}_`, '');
  const messageID = closeAction.callback_id.replace(`${CALLBACK_BUTTON}_`, '');
  const isClosed = await getMessageIsClosed(messageID);

  logger.log('/button', {
    userID,
    lunchID,
    messageID,
    action,
    isClosed,
  });

  /**
   * press close/reopen button by authorized users
   */
  if (action === CLOSE_ACTION) {
    return handleCloseAction(ctx, {
      closeAction,
      userID,
      responseURL,
      messageID,
      isClosed,
    });
  }

  /**
   * order closed
   */
  if (isClosed) {
    logger.warn('The order is closed!');

    ctx.status = 200;
    ctx.body = '';

    respondMessage(responseURL, {
      response_type: 'ephemeral',
      replace_original: false,
      text: '⚠️ The order is closed!',
      color: 'warning',
    });

    return;
  }

  /**
   * usual user click on plus button
   */
  const isSuccess = await orderLunch(lunchID, {
    userID,
    action,
  });

  ctx.status = 200;
  ctx.body = null;

  if (!isSuccess) {
    return respondMessage(responseURL, {
      response_type: 'ephemeral',
      replace_original: false,
      text: '🚫 You have exceeded your daily lunch quota!',
      color: 'warning',
    });
  }

  updateMessage(messageID);
};

module.exports = button;
