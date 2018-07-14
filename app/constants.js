exports.COUNT_EMOJI = ':heavy_plus_sign:';
exports.MINUS_EMOJI = ':heavy_minus_sign:';
exports.MAIN_COLOR = '#FF0077';
exports.PORT = 5000;
exports.CLOSE_ACTION = 'close-order';
exports.CLOSE_TEXT = '🚫 Close';
exports.REOPEN_TEXT = '🚫 Reopen';

exports.PRICE_REGEX = /\$([\d.]+)$/;

// kaihao, julie, miffy, claire.h
exports.CLOSE_USER_WHITE_LIST = process.env.CLOSE_USER_WHITE_LIST.split(',')
  .map(user => user.trim())
  .filter(Boolean);
