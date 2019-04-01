const {
  html,
  Overflow,
  Option,
  Mrkdwn,
  User,
  Button,
} = require('../../slack-block-kit');
const {
  ORDER_DRINK_BLOCK_ID,
  DAILYDRINK_OVERFLOW_BLOCK_ID,
} = require('../constants');
const Order = require('./Order');

const Drink = ({
  title,
  userID,
  store,
  orders = [],
  messageID,
  isClosed = false,
}) => html`
<>
  <image image_url=${store.imageURL} alt_text=${store.storeName} />
  <section
    block_id=${`${DAILYDRINK_OVERFLOW_BLOCK_ID}_${messageID}`}
    text=${html`
      <${Mrkdwn}><b>${title}</b><//>
    `}
    accessory=${html`
      <${Overflow} action_id=${messageID}>
        <${Option} value=${isClosed ? 'reopen-order' : 'close-order'}>
          ${isClosed ? 'Reopen Order' : 'Close order'}
        <//>
        <${Option} value="edit-order">Edit Order<//>
      <//>
    `}
  />
  <context
    elements=${[
      html`
        <${Mrkdwn}>
          ${store.storeName}${'   '}<i>by <${User}>${userID}<//></i>
        <//>
      `,
    ]}
  />
  <divider />
  ${orders.map(
    order => html`
      <${Order} order=${order} messageID=${messageID} isClosed=${isClosed} />
    `
  )}
  ${orders.length > 0 &&
    html`
      <divider />
      <section
        fields=${html`
          <>
            <${Mrkdwn}>
              <b>Total Count</b>
              <br />
              ${orders.length}
            <//>
            <${Mrkdwn}>
              <b>Total Price</b>
              <br />
              $${orders.reduce((sum, order) => sum + order.price, 0)}
            <//>
          </>
        `}
      />
    `}
  ${!isClosed &&
    html`
      <actions
        block_id=${`${ORDER_DRINK_BLOCK_ID}_${messageID}`}
        elements=${html`
          <>
            <${Button} action_id="order-drink">Order drink<//>
          </>
        `}
      />
    `}
</>
`;

module.exports = Drink;
