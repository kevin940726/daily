const Router = require('koa-router');

const verify = require('./verify');
const { create } = require('./create');
const interactive = require('./interactive');

const appRouter = new Router();
const slackRouter = new Router({
  prefix: '/slack',
});

slackRouter.use(verify());

slackRouter.post('/slash', create);
slackRouter.post('/interactive', interactive);

appRouter.get('/', ctx => {
  ctx.body = '200';
});

appRouter.use(slackRouter.routes(), slackRouter.allowedMethods());

module.exports = appRouter;
