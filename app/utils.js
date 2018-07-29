const {
  MAIN_COLOR,
  COUNT_EMOJI,
  MINUS_EMOJI,
  COLLISION_EMOJI,
  CLOSE_ACTION,
  CLOSE_TEXT,
  REOPEN_TEXT,
  CALLBACK_BUTTON,
} = require('./constants');

exports.buildAttachments = (lunches, { isClosed } = {}) =>
  lunches.map(lunch => ({
    title: isClosed ? `(${lunch.total}) ${lunch.name}` : lunch.name,
    text: lunch.text,
    callback_id: `${CALLBACK_BUTTON}_${lunch.lunchID}`,
    color: MAIN_COLOR,
    actions: isClosed
      ? null
      : [
          {
            name: lunch.lunchID,
            text: COUNT_EMOJI,
            type: 'button',
            value: 'plus',
          },
          {
            name: lunch.lunchID,
            text: MINUS_EMOJI,
            type: 'button',
            value: 'minus',
          },
        ],
  }));

exports.buildCloseAction = (messageID, isClosed) => ({
  title: '',
  callback_id: `${CALLBACK_BUTTON}_${messageID}`,
  color: 'warning',
  actions: [
    {
      name: CLOSE_ACTION,
      text: isClosed ? REOPEN_TEXT : CLOSE_TEXT,
      type: 'button',
      style: 'danger',
      value: CLOSE_ACTION,
    },
  ],
});

exports.getLunch = (lunchList, exceedUsers = {}) =>
  lunchList.map(lunch => {
    const users = Object.values(lunch.users);

    return {
      name: lunch.name,
      lunchID: lunch.lunchID,
      price: lunch.price,
      text: users
        .sort((a, b) => a.updateTimestamp - b.updateTimestamp)
        .filter(u => u.count > 0)
        .map(
          u =>
            `<@${u.userID}>${u.count > 1 ? `(${u.count})` : ''} ${
              exceedUsers[u.userID] ? COLLISION_EMOJI : ''
            }`
        )
        .join(', '),
      total: users.map(u => u.count).reduce((sum, cur) => sum + cur, 0),
    };
  });

const TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

exports.getDayKey = timestamp => {
  const shiftedDate = new Date(timestamp + TIMEZONE_OFFSET);

  return [
    shiftedDate.getUTCFullYear(),
    shiftedDate.getUTCMonth() + 1,
    shiftedDate.getUTCDate(),
  ].join('-');
};
