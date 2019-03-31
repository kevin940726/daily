const {
  html,
  Overflow,
  Option,
  Mrkdwn,
  User,
} = require('../../slack-block-kit');
const { ORDER_OVERFLOW_BLOCK_ID } = require('../constants');
const { mapSizeToLabel, mapIceToLabel, mapSugarToLabel } = require('../utils');

const Order = ({ order, messageID, isClosed }) => html`
  <section
    block_id=${`${ORDER_OVERFLOW_BLOCK_ID}_${order.orderID}`}
    text=${html`
      <${Mrkdwn}>
        <${User}>${order.userID}<//>:${' '}
        <b>${order.orderName}</b>${'  '}(<b>$${order.price}</b>)
        <br />
        ${[
          mapSizeToLabel(order.size),
          mapIceToLabel(order.ice),
          mapSugarToLabel(order.sugar),
          order.ingredients ? `(${order.ingredients})` : '',
        ]
          .filter(Boolean)
          .join(', ')}
      <//>
    `}
    accessory=${!isClosed
      ? html`
          <${Overflow} action_id=${messageID}>
            <${Option} value="edit-order" emoji>
              Edit order
            <//>
            <${Option} value="remove-order" emoji>
              Remove order
            <//>
          <//>
        `
      : undefined}
  />
`;

module.exports = Order;
