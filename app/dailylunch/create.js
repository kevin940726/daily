const nanoID = require('nanoid');
const { PRICE_REGEX, CLOSE_ACTION, CLOSE_TEXT } = require('../constants');
const { createLunch } = require('../store');
const logger = require('../logger');
const { respondMessage } = require('../slack');
const { buildAttachments } = require('../utils');

const create = async ctx => {
  const {
    user_name: userName,
    user_id: userID,
    channel_name: channelName,
    text,
    response_url: responseURL,
  } = ctx.request.body;

  const messageID = nanoID();

  const lunches = text
    .split('\r\n')
    .map(lunch => lunch.trim())
    .filter(Boolean)
    .map(lunch => ({
      lunchID: nanoID(),
      name: lunch,
      price: parseFloat((lunch.match(PRICE_REGEX) || [])[1]) || 0,
    }));

  await createLunch(messageID, {
    lunch: lunches,
    userID,
  });

  logger.log('/create', {
    userID,
    userName,
    channelName,
    text,
    messageID,
  });

  ctx.status = 200;
  ctx.body = null;

  respondMessage(responseURL, {
    response_type: 'in_channel',
    attachments: buildAttachments(lunches).concat({
      title: '',
      callback_id: messageID,
      color: 'warning',
      actions: [
        {
          name: CLOSE_ACTION,
          text: CLOSE_TEXT,
          type: 'button',
          style: 'danger',
          value: CLOSE_ACTION,
        },
      ],
    }),
  });
};

module.exports = create;
