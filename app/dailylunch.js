const Router = require('koa-router');
const logger = require('./logger');
const store = require('./store');
const { respondMessage } = require('./slack');
const { mapLunchTextToSet, mapSetToLunchText } = require('./utils');
const {
  COUNT_EMOJI,
  MAIN_COLOR,
  CLOSE_ACTION,
  CLOSE_TEXT,
  REOPEN_TEXT,
  CLOSE_USER_WHITE_LIST,
} = require('./constants');

const router = new Router();

router.post('/create', async (ctx) => {
  const {
    user_name: userName,
    user_id: userID,
    channel_name: channelName,
    text,
    response_url: responseURL,
  } = ctx.request.body;

  logger.log('/create', {
    userID,
    userName,
    channelName,
    text,
  });

  const lunches = text.split('\r\n')
    .map(lunch => lunch.trim())
    .filter(Boolean);

  ctx.status = 200;
  ctx.body = null;

  respondMessage(responseURL, {
    response_type: 'in_channel',
    attachments: lunches
      .map((lunch, index) => ({
        title: lunch,
        callback_id: `lunch-${index}`,
        color: MAIN_COLOR,
        actions: [{
          name: `lunch-${index}`,
          text: COUNT_EMOJI,
          type: 'button',
          value: lunch,
        }],
      }))
      .concat({
        title: '',
        callback_id: CLOSE_ACTION,
        color: 'warning',
        actions: [{
          name: CLOSE_ACTION,
          text: CLOSE_TEXT,
          type: 'button',
          style: 'danger',
          value: userID,
        }],
      }),
  });
});

router.post('/button', async (ctx) => {
  const body = JSON.parse(ctx.request.body.payload);

  const {
    callback_id: callbackID,
    user,
    message_ts: ts,
    original_message: originalMessage,
    response_url: responseURL,
  } = body;

  const attachments = originalMessage.attachments.filter(attachment => attachment.callback_id !== CLOSE_ACTION);
  const closeAction = originalMessage.attachments.find(attachment => attachment.callback_id === CLOSE_ACTION);
  const closeUserWhiteList = CLOSE_USER_WHITE_LIST.concat(closeAction.actions[0].value);

  logger.log('/button', {
    callbackID,
    user,
    action: originalMessage.attachments.find(attachment => attachment.callback_id === callbackID),
  });

  if (!store.has(ts)) {
    const lunches = attachments
      .reduce((map, lunch) => (
        map.set(lunch.callback_id, mapLunchTextToSet(lunch.text))
      ), new Map());

    store.set(ts, lunches);
  }

  /**
   * press close/reopen button by authorized users
   */
  if (callbackID === CLOSE_ACTION) {
    if (!closeUserWhiteList.includes(user.id)) {
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

    let lunches = attachments;
    if (store.getIsClosed(ts)) {
      // closed, reopen
      closeAction.actions[0].text = CLOSE_TEXT;
      store.setIsClosed(ts, false);

      lunches = lunches
        .map((lunch, index) => {
          const set = store.getLunch(ts, lunch.callback_id);
          const title = lunch.title.split(' ').slice(1).join(' ');

          return {
            ...lunch,
            title,
            actions: [{
              name: `lunch-${index}`,
              text: `${COUNT_EMOJI}${set.size ? ` ${set.size}` : ''}`,
              type: 'button',
              value: title,
            }],
          };
        });
    } else {
      // opened, close
      closeAction.actions[0].text = REOPEN_TEXT;
      store.setIsClosed(ts, true);

      lunches = lunches
        .map((lunch) => {
          const set = store.getLunch(ts, lunch.callback_id);

          return {
            ...lunch,
            title: `(${set.size}) ${lunch.title}`,
            actions: null,
          };
        });
    }

    ctx.body = {
      ...originalMessage,
      attachments: lunches
        .concat(closeAction),
    };

    return;
  }

  /**
   * order closed
   */
  if (store.getIsClosed(ts)) {
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
  const currentUser = `<@${user.id}>`;

  store.toggleUser(ts, callbackID, currentUser);

  ctx.body = {
    ...originalMessage,
    attachments: attachments
      .map((lunch) => {
        const set = store.getLunch(ts, lunch.callback_id);

        return {
          ...lunch,
          text: mapSetToLunchText(set),
          actions: [{
            ...lunch.actions[0],
            text: `${COUNT_EMOJI}${set.size ? ` ${set.size}` : ''}`,
          }],
        };
      })
      .concat(closeAction),
  };
});

router.get('/', (ctx) => {
  ctx.body = '200';
});

module.exports = router;
