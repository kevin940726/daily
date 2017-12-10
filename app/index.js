const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const dailylunch = require('./dailylunch');
const { PORT } = require('./constants');

const app = new Koa();

app.use(bodyParser());

app.use(dailylunch.routes())
  .use(dailylunch.allowedMethods());

app.listen(PORT);
