const { html } = require('../../../slack-block-kit');
const Order = require('../Order');

test('it renders <Order />', () => {
  const block = html`
    <${Order}
      order=${{
        orderID: 'orderID',
        orderName: 'orderName',
        userID: 'userID',
        size: 'l',
        ice: 'free',
        sugar: 'free',
        price: 50,
        ingredients: 'ingredients',
      }}
      messageID="messageID"
      isClosed=${false}
    />
  `;

  expect(block).toMatchSnapshot();
});

test('it renders <Order /> with closed', () => {
  const block = html`
    <${Order}
      order=${{
        orderID: 'orderID',
        orderName: 'orderName',
        userID: 'userID',
        size: 'l',
        ice: 'free',
        sugar: 'free',
        price: 50,
        ingredients: 'ingredients',
      }}
      messageID="messageID"
      isClosed
    />
  `;

  expect(block).toMatchSnapshot();
});
