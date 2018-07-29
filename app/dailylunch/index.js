const Router = require('koa-router');

const { create } = require('./create');
const interactive = require('./interactive');

const router = new Router();

router.post('/slash', create);

router.post('/interactive', interactive);

router.get('/', ctx => {
  ctx.body = '200';
});

module.exports = router;
