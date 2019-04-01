const crypto = require('crypto');
const { SIGNING_SECRET } = require('../constants');

const VERSION = 'v0';

const verifyMiddleware = () => async (ctx, next) => {
  const request = ctx.request;

  const timestamp = request.header['x-slack-request-timestamp'];
  const body = request.rawBody;

  // The request timestamp is more than five minutes from local time.
  // It could be a replay attack, so let's ignore it
  if (Math.abs(timestamp - Date.now()) > 60 * 5) {
    return next();
  }

  const signBase = [VERSION, timestamp, body].join(':');
  const hmac = crypto.createHmac('sha256', SIGNING_SECRET);

  const sign = hmac.update(signBase);
  const slackSign = Buffer.from(request.header['x-slack-signature'], 'hex');

  if (!crypto.timingSafeEqual(sign, slackSign)) {
    return;
  }

  return next();
};

module.exports = verifyMiddleware;
