const Router = require('koa-router');
const verifyMiddleware = require('./verifyMiddleware');
const parsePayloadMiddleware = require('./parsePayloadMiddleware');
const respondMiddleware = require('./respondMiddleware');
const interactive = require('./interactive');
const options = require('./options');
const { create: slashDailylunch } = require('../dailylunch/create');
const { create: slashDailydrink } = require('../dailydrink/create');

const slackRouter = new Router({
  prefix: '/slack',
});

slackRouter.use(verifyMiddleware());
slackRouter.use(parsePayloadMiddleware());
slackRouter.use(respondMiddleware());
slackRouter.post('/interactive', interactive);
slackRouter.post('/options', options);
slackRouter.post('/slash/dailylunch', slashDailylunch);
slackRouter.post('/slash/dailydrink', slashDailydrink);

module.exports = slackRouter;
