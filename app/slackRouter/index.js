const Router = require('koa-router');
const verify = require('./verify');
const parsePayloadMiddleware = require('./parsePayloadMiddleware');
const interactive = require('./interactive');
const options = require('./options');
const { create: slashDailylunch } = require('../dailylunch/create');
const { create: slashDailydrink } = require('../dailydrink/create');

const slackRouter = new Router({
  prefix: '/slack',
});

slackRouter.use(verify());
slackRouter.use(parsePayloadMiddleware);
slackRouter.post('/interactive', interactive);
slackRouter.post('/options', options);
slackRouter.post('/slash/dailylunch', slashDailylunch);
slackRouter.post('/slash/dailydrink', slashDailydrink);

module.exports = slackRouter;
