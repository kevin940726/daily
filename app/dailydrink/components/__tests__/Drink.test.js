const { html } = require('../../../slack-block-kit');
const Drink = require('../Drink');

test('it renders <Drink />', () => {
  const block = html`
    <${Drink}
      title="title"
      userID="userID"
      store=${{
        storeName: 'storeName',
        imageURL: 'https://via.placeholder.com/150',
      }}
      orders=${[
        {
          orderID: 'orderID',
          orderName: 'orderName',
          userID: 'userID',
          size: 'l',
          ice: 'free',
          sugar: 'free',
          price: 50,
          ingredients: 'ingredients',
        },
        {
          orderID: 'orderID2',
          orderName: 'orderName',
          userID: 'userID',
          size: 'l',
          ice: 'free',
          sugar: 'free',
          price: 50,
          ingredients: 'ingredients',
        },
      ]}
      messageID="messageID"
      isClosed=${false}
    />
  `;

  expect(block).toMatchSnapshot();
});

test('it renders <Drink /> with closed', () => {
  const block = html`
    <${Drink}
      title="title"
      userID="userID"
      store=${{
        storeName: 'storeName',
        imageURL: 'https://via.placeholder.com/150',
      }}
      orders=${[
        {
          orderID: 'orderID',
          orderName: 'orderName',
          userID: 'userID',
          size: 'l',
          ice: 'free',
          sugar: 'free',
          price: 50,
          ingredients: 'ingredients',
        },
        {
          orderID: 'orderID2',
          orderName: 'orderName',
          userID: 'userID',
          size: 'l',
          ice: 'free',
          sugar: 'free',
          price: 50,
          ingredients: 'ingredients',
        },
      ]}
      messageID="messageID"
      isClosed
    />
  `;

  expect(block).toMatchSnapshot();
});
