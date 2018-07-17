const Router = require('koa-router');

const create = require('./create');
const button = require('./button');

const router = new Router();

router.post('/create', create);

router.post('/button', button);

router.get('/', ctx => {
  ctx.body = '200';
});

module.exports = router;
