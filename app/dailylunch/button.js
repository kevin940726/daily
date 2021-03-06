const logger = require('../logger');
const {
  orderLunch,
  getMessageIsClosed,
  getMessageCreatorID,
  setMessageClose,
  updateMessage,
} = require('../store');
const { throwError, throwWarning } = require('../slack');
const {
  CLOSE_ACTION,
  CLOSE_USER_WHITE_LIST,
  CALLBACK_BUTTON,
} = require('../constants');

const handleCloseAction = async (
  ctx,
  { userID, responseURL, messageID, isClosed }
) => {
  const creatorID = await getMessageCreatorID(messageID);

  const closeUserWhiteList = CLOSE_USER_WHITE_LIST.concat(creatorID);

  if (!closeUserWhiteList.includes(userID)) {
    logger.error('Authorized staffs only!');

    ctx.status = 200;
    ctx.body = '';

    throwError(responseURL, 'Authorized staffs only!');

    return;
  }

  await setMessageClose(messageID, !isClosed);

  ctx.status = 200;
  ctx.body = null;

  updateMessage(messageID, responseURL);
};

const button = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const {
    actions: [{ value: action }],
    callback_id: callbackID,
    user: { id: userID, name: userName },
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
    userName,
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

    throwWarning(responseURL, 'The order is closed!');

    return;
  }

  /**
   * usual user click on plus button
   */
  try {
    await orderLunch(messageID, {
      lunchID,
      userID,
      userName,
      action,
    });
  } catch (err) {
    // predefined error
    if (typeof err === 'string') {
      return throwWarning(responseURL, err);
    }

    return;
  }

  ctx.status = 200;
  ctx.body = null;

  updateMessage(messageID, responseURL);
};

module.exports = button;
