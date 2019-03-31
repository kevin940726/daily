const fetch = require('node-fetch');
const { SLACK_TOKEN } = require('./constants');

const slackAPI = (method, payload) =>
  fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${SLACK_TOKEN}`,
    },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .catch(err => console.error(err));

exports.respondMessage = (responseURL, message) =>
  fetch(responseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

exports.openDialog = (triggerID, dialog) =>
  slackAPI('dialog.open', {
    trigger_id: triggerID,
    dialog,
  });

exports.deleteMessage = (channelID, messageTS, asUser) =>
  slackAPI('chat.delete', {
    channel: channelID,
    ts: messageTS,
    as_user: asUser,
  });

exports.throwError = (responseURL, error) =>
  exports.respondMessage(responseURL, {
    response_type: 'ephemeral',
    replace_original: false,
    text: `🚫  ${error}`,
    color: 'danger',
  });

exports.throwWarning = (responseURL, warning) =>
  exports.respondMessage(responseURL, {
    response_type: 'ephemeral',
    replace_original: false,
    text: `⚠️ ${warning}`,
    color: 'warning',
  });
