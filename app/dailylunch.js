const Router = require('koa-router');
const logger = require('./logger');
const { COUNT_EMOJI, MAIN_COLOR } = require('./constants');
const store = require('./store');
const { mapLunchTextToSet, mapSetToLunchText } = require('./utils');

const router = new Router();

router.post('/create', async (ctx) => {
  logger.log(ctx.request.body);

  const { text } = ctx.request.body;

  const lunches = text.split('\r\n')
    .map(lunch => lunch.trim())
    .filter(Boolean);

  ctx.body = {
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
      })),
  };
});

router.post('/button', async (ctx) => {
  const body = JSON.parse(ctx.request.body.payload);

  logger.log(body);

  const { callback_id: callbackID, user, message_ts: ts, original_message: originalMessage } = body;

  const lunches = originalMessage.attachments
    .reduce((map, lunch) => (
      map.set(lunch.callback_id, mapLunchTextToSet(lunch.text))
    ), new Map());

  store.set(ts, lunches);

  const currentUser = `<@${user.id}>`;

  if (store.has(ts, callbackID, currentUser)) {
    store.delete(ts, callbackID, currentUser);
  } else {
    store.add(ts, callbackID, currentUser);
  }

  ctx.body = {
    ...originalMessage,
    attachments: originalMessage.attachments
      .map((lunch) => {
        const set = store.get(ts, lunch.callback_id);

        return {
          ...lunch,
          text: mapSetToLunchText(set),
          actions: [{
            ...lunch.actions[0],
            text: `${COUNT_EMOJI}${set.size ? ` ${set.size}` : ''}`,
          }],
        };
      }),
  };
});

module.exports = router;
