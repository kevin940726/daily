const parsePayloadMiddleware = async (ctx, next) => {
  if (ctx.request && ctx.request.body && ctx.request.body.payload) {
    try {
      const body = JSON.parse(ctx.request.body.payload);

      ctx.state.body = body;
    } catch (err) {
      // do nothing
    }
  }

  return next();
};

module.exports = parsePayloadMiddleware;
