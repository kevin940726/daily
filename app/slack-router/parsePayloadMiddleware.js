const parsePayloadMiddleware = () => async (ctx, next) => {
  try {
    const body = JSON.parse(ctx.request.body.payload);

    ctx.state.body = body;
  } catch (err) {
    // do nothing
  }

  return next();
};

module.exports = parsePayloadMiddleware;
