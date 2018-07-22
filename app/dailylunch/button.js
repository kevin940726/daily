const logger = require('../logger');
const {
  orderLunch,
  getMessageIsClosed,
  setMessageClose,
  updateMessage,
  updateMessageTS,
} = require('../store');
const { respondMessage } = require('../slack');
const { CLOSE_ACTION, CLOSE_USER_WHITE_LIST } = require('../constants');

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
    message_ts: messageTS,
    original_message: originalMessage,
    response_url: responseURL,
  } = body;

  const closeAction = originalMessage.attachments.find(
    attachment =>
      attachment.actions &&
      attachment.actions.find(act => act.value === CLOSE_ACTION)
  );

  const lunchID = callbackID;
  const messageID = closeAction.callback_id;
  const isClosed = await getMessageIsClosed(messageID);

  logger.log('/button', {
    userID,
    lunchID,
    messageID,
    action,
    isClosed,
  });

  updateMessageTS(messageID, messageTS);

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
  const messagesShouldUpdate = await orderLunch(lunchID, {
    userID,
    action,
  });

  ctx.status = 200;
  ctx.body = null;

  messagesShouldUpdate.forEach(messageID => {
    updateMessage(messageID);
  });
};

module.exports = button;
