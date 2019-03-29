const { ORDER_OVERFLOW_BLOCK_ID } = require('../constants');
const { mapSizeToLabel, mapIceToLabel, mapSugarToLabel } = require('../utils');

const Order = ({ order, messageID, isClosed }) => ({
  type: 'section',
  block_id: `${ORDER_OVERFLOW_BLOCK_ID}_${order.orderID}`,
  text: {
    type: 'mrkdwn',
    text: `<@${order.userID}>: *${order.orderName}*  (*$${order.price}*)\n${[
      mapSizeToLabel(order.size),
      mapIceToLabel(order.ice),
      mapSugarToLabel(order.sugar),
      order.ingredients ? `(${order.ingredients})` : '',
    ]
      .filter(Boolean)
      .join(', ')}`,
  },
  accessory: !isClosed
    ? {
        type: 'overflow',
        action_id: messageID,
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'Edit order',
              emoji: true,
            },
            value: 'edit-order',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Remove order',
              emoji: true,
            },
            value: 'remove-order',
          },
        ],
      }
    : undefined,
});

module.exports = Order;
