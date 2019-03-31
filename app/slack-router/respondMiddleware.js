const { respondMessage } = require('../slack');

const respondMiddleware = () => async (ctx, next) => {
  ctx.ok = () => {
    ctx.status = 200;
    ctx.body = null;
  };

  ctx.sendError = (responseURL, error) => {
    ctx.ok();
    respondMessage(responseURL, {
      response_type: 'ephemeral',
      replace_original: false,
      text: `🚫  ${error}`,
      color: 'danger',
    });
  };

  ctx.sendWarning = (responseURL, warning) => {
    ctx.ok();
    respondMessage(responseURL, {
      response_type: 'ephemeral',
      replace_original: false,
      text: `⚠️ ${warning}`,
      color: 'warning',
    });
  };

  return next();
};

module.exports = respondMiddleware;
