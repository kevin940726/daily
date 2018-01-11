const fetch = require('node-fetch');

exports.respondMessage = (responseURL, message) => fetch(
  responseURL,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  }
);
