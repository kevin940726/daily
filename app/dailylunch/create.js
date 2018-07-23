const generate = require('nanoid/generate');
const url = require('nanoid/url');
const {
  PRICE_REGEX,
  CLOSE_ACTION,
  CLOSE_TEXT,
  CLOSE_USER_WHITE_LIST,
} = require('../constants');
const { createLunch } = require('../store');
const logger = require('../logger');
const { postChat } = require('../slack');
const { buildAttachments } = require('../utils');

const alphabets = url.replace('~', '-');
const nanoID = () => generate(alphabets, 16);

const create = async ctx => {
  const {
    user_name: userName,
    user_id: userID,
    channel_name: channelName,
    channel_id: channelID,
    text,
  } = ctx.request.body;

  const messageID = nanoID();

  const lunches = text
    .split('\r\n')
    .map(lunch => lunch.trim())
    .filter(Boolean)
    .map((lunch, index) => ({
      lunchID: nanoID(),
      name: lunch,
      price: parseFloat((lunch.match(PRICE_REGEX) || [])[1]) || 0,
      index,
    }));

  // TODO: add condition here
  const isDailylunch =
    CLOSE_USER_WHITE_LIST.includes(userID) &&
    lunches.every(lunch => !Number.isNaN(lunch.price));

  logger.log('/create', {
    userID,
    userName,
    channelName,
    channelID,
    text,
    messageID,
  });

  ctx.status = 200;
  ctx.body = null;

  postChat(
    { channel: channelID },
    {
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
    }
  ).then(response => {
    if (response && response.ok) {
      createLunch(messageID, {
        lunch: lunches,
        userID,
        isDailylunch,
        channelID,
        messageTS: response.message.ts,
      });
    }
  });
};

module.exports = create;
