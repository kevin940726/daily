const Router = require('koa-router');
const nanoID = require('nanoid');
const logger = require('./logger');
const {
  createLunch,
  orderLunch,
  getMessageLunch,
  getMessageIsClosed,
  setMessageClose,
} = require('./store');
const { respondMessage } = require('./slack');
const { getLunch, buildAttachments } = require('./utils');
const {
  COUNT_EMOJI,
  MINUS_EMOJI,
  MAIN_COLOR,
  CLOSE_ACTION,
  CLOSE_TEXT,
  REOPEN_TEXT,
  CLOSE_USER_WHITE_LIST,
} = require('./constants');
const create = require('./create');
const button = require('./button');

const router = new Router();

router.post('/create', create);

router.post('/button', button);

router.get('/', ctx => {
  ctx.body = '200';
});

module.exports = router;
