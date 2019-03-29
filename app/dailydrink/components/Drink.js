const { jsxslack: jsx } = require('@speee-js/jsx-slack');
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
}) =>
  [
    ...jsx`
    <Blocks>
      <Image src="${store.imageURL}" alt="${store.storeName}" />
      <Section blockId="${`${DAILYDRINK_OVERFLOW_BLOCK_ID}_${messageID}`}">
        <b>${title}</b>
        <Overflow actionId="${messageID}">
          <OverflowItem
            value="${isClosed ? 'reopen-order' : 'close-order'}"
          >
            ${isClosed ? 'Reopen Order' : 'Close order'}
          </OverflowItem>
          <OverflowItem value="edit-order">Edit order</OverflowItem>
        </Overflow>
      </Section>
      <Context>
        <p>
          ${store.storeName}${'   '}<i>by <a href="${`@${userID}`}" /></i>
        </p>
      </Context>
      <Divider />
    </Blocks>
  `,
    ...orders.map(order => Order({ order, messageID, isClosed })),
    orders.length > 0 && jsx`<Divider />`,
    orders.length > 0 &&
      jsx`
      <Section>
        <Field>
          <b>Total Count</b>
          <br />
          ${orders.length}
        </Field>
        <Field>
          <b>Total Price</b>
          <br />
          $${orders.reduce((sum, order) => sum + order.price, 0)}
        </Field>
      </Section>
    `,
    !isClosed &&
      jsx`
    <Actions blockId="${`${ORDER_DRINK_BLOCK_ID}_${messageID}`}">
      <Button actionId="order-drink">Order drink</Button>
    </Actions>
  `,
  ].filter(Boolean);

module.exports = Drink;
