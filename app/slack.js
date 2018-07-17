const fetch = require('node-fetch');

const token = process.env.SLACK_TOKEN;

const slackAPI = (method, payload) =>
  fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then(res => res.json());

exports.respondMessage = (responseURL, message) =>
  fetch(responseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

exports.updateChat = ({ ts, channel }, message) =>
  slackAPI('chat.update', {
    ts,
    channel,
    ...message,
  });

exports.postChat = ({ channel }, message) =>
  slackAPI('chat.postMessage', {
    channel,
    ...message,
  });
