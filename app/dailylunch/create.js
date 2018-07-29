const generate = require('nanoid/generate');
const url = require('nanoid/url');
const {
  PRICE_REGEX,
  CLOSE_USER_WHITE_LIST,
  CALLBACK_DIALOG,
} = require('../constants');
const { createLunch } = require('../store');
const logger = require('../logger');
const { postChat, openDialog } = require('../slack');
const { buildAttachments, buildCloseAction } = require('../utils');

const alphabets = url.replace('~', '-');
const nanoID = () => generate(alphabets, 16);

exports.create = async ctx => {
  const { trigger_id: triggerID, user_id: userID, text } = ctx.request.body;

  const messageID = nanoID();

  logger.log('/create', {
    userID,
    messageID,
    triggerID,
    text,
  });

  ctx.status = 200;
  ctx.body = null;

  const isAuthorizedDailylunch = CLOSE_USER_WHITE_LIST.includes(userID);

  return openDialog(triggerID, {
    callback_id: `${CALLBACK_DIALOG}_${messageID}`,
    title: 'Submit new menu',
    submit_label: 'Submit',
    elements: [
      {
        type: 'text',
        label: 'Title',
        optional: true,
        hint: 'The title or name of the menu',
        name: 'title',
      },
      ...[
        isAuthorizedDailylunch && {
          type: 'select',
          label: 'Is dailylunch?',
          name: 'isDailylunch',
          options: [
            {
              label: 'not dailylunch',
              value: 'false',
            },
            {
              label: 'is dailylunch',
              value: 'true',
            },
          ],
          value: 'true',
        },
      ].filter(Boolean),
      {
        label: 'Orders',
        name: 'orders',
        type: 'textarea',
        hint: 'Lines separated orders',
        value: text,
      },
    ],
  });
};

exports.submitDialog = async ctx => {
  const body = JSON.parse(ctx.request.body.payload);

  const {
    user: { id: userID },
    channel: { id: channelID },
    callback_id: callbackID,
    submission,
  } = body;

  const messageID = callbackID.replace(`${CALLBACK_DIALOG}_`, '');

  const { orders, title } = submission;
  const isDailylunch = !!(
    submission.isDailylunch && JSON.parse(submission.isDailylunch)
  );

  const lunches = orders
    .split('\n')
    .map(lunch => lunch.trim())
    .filter(Boolean)
    .map((lunch, index) => ({
      lunchID: nanoID(),
      name: lunch,
      price: parseFloat((lunch.match(PRICE_REGEX) || [])[1]) || 0,
      index,
    }));

  logger.log('/dialog', {
    userID,
    channelID,
    messageID,
    title,
    isDailylunch,
    orders,
  });

  ctx.status = 200;
  ctx.body = null;

  postChat(
    { channel: channelID },
    {
      response_type: 'in_channel',
      text: title,
      attachments: buildAttachments(lunches).concat(
        buildCloseAction(messageID, false)
      ),
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
