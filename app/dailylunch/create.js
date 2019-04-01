const {
  PRICE_REGEX,
  LIMIT_REGEX,
  CLOSE_USER_WHITE_LIST,
  CALLBACK_DIALOG,
} = require('../constants');
const { createLunch } = require('../store');
const logger = require('../logger');
const { respondMessage, openDialog } = require('../slack');
const {
  buildAttachments,
  buildCloseAction,
  boldTitle,
  nanoID,
} = require('../utils');

exports.create = async ctx => {
  const {
    trigger_id: triggerID,
    user_id: userID,
    user_name: userName,
    text,
  } = ctx.request.body;

  const messageID = nanoID();

  logger.log('/create', {
    userID,
    userName,
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
    user: { id: userID, name: userName },
    channel: { id: channelID },
    callback_id: callbackID,
    submission,
    response_url: responseURL,
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
      limit: parseInt((lunch.match(LIMIT_REGEX) || [])[1], 10) || 0,
      total: 0,
      index,
    }));

  logger.log('/dialog', {
    userID,
    userName,
    channelID,
    messageID,
    title,
    isDailylunch,
    orders,
  });

  ctx.status = 200;
  ctx.body = null;

  respondMessage(responseURL, {
    response_type: 'in_channel',
    text: boldTitle(title),
    attachments: buildAttachments(lunches).concat(
      buildCloseAction(messageID, false)
    ),
  })
    .then(res => res.json())
    .then(response => {
      if (response && response.ok) {
        createLunch(messageID, {
          lunch: lunches,
          title,
          userID,
          userName,
          isDailylunch,
          channelID,
        });
      }
    });
};
