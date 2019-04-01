exports.COUNT_EMOJI = ':heavy_plus_sign:';
exports.MINUS_EMOJI = ':heavy_minus_sign:';
exports.COLLISION_EMOJI = ':collision:';
exports.MAIN_COLOR = '#FF0077';
exports.PORT = 5000;
exports.CLOSE_ACTION = 'close-order';
exports.CLOSE_TEXT = '🚫 Close';
exports.REOPEN_TEXT = '🚫 Reopen';

exports.PRICE_REGEX = /[$＄] *([\d.]+)/;
exports.LIMIT_REGEX = /限量 *(\d+)/;

exports.DAILYLUNCH_MAX_PRICE = 150;

/**
 * errors
 */
exports.ERROR_EXCEED_PRICE = 'You have exceeded your daily lunch quota!';
exports.ERROR_EXCEED_LIMIT = 'The limit is reached!';

// slack env
exports.SLACK_ENV = process.env.SLACK_ENV || 'development';

exports.SIGNING_SECRET =
  exports.SLACK_ENV === 'development'
    ? process.env.DEV_SIGNING_SECRET
    : process.env.SIGNING_SECRET;
exports.SLACK_TOKEN =
  exports.SLACK_ENV === 'development'
    ? process.env.DEV_SLACK_TOKEN
    : process.env.SLACK_TOKEN;

/**
 * callback prefix
 */
exports.CALLBACK_DIALOG = 'DIALOG';
exports.CALLBACK_BUTTON = 'BUTTON';

// kaihao, julie, miffy, claire.h
exports.CLOSE_USER_WHITE_LIST = process.env.CLOSE_USER_WHITE_LIST.split(',')
  .map(user => user.trim())
  .filter(Boolean);

exports.DAILYLUNCH_USERS = process.env.CLOSE_USER_WHITE_LIST.split(',')
  .map(user => user.trim())
  .filter(Boolean);
