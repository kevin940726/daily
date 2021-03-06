require('dotenv').config();

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const slackRouter = require('./slack-router');
const { PORT } = require('./constants');

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

app.on('error', err => {
  console.log(err);
});

app.use(bodyParser());

app.use(slackRouter.routes(), slackRouter.allowedMethods());

app.listen(PORT);
