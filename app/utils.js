const { MAIN_COLOR, COUNT_EMOJI, MINUS_EMOJI } = require('./constants');

exports.buildAttachments = (lunches, { isClosed } = {}) =>
  lunches.map(lunch => ({
    title: isClosed ? `(${lunch.total}) ${lunch.name}` : lunch.name,
    text: lunch.text,
    callback_id: lunch.lunchID,
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

exports.getLunch = lunchList =>
  lunchList.map(lunch => ({
    name: lunch.name,
    lunchID: lunch.lunchID,
    price: lunch.price,
    text: Object.values(lunch.users)
      .sort((a, b) => a.updateTimestamp - b.updateTimestamp)
      .filter(u => u.count > 0)
      .map(u => `<@${u.userID}>${u.count > 1 ? `(${u.count})` : ''}`)
      .join(', '),
    total: Object.values(lunch.users)
      .map(u => u.count)
      .reduce((sum, cur) => sum + cur, 0),
  }));
