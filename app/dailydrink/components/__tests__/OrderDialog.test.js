const { html } = require('../../../slack-block-kit');
const OrderDialog = require('../OrderDialog');

test('it renders <OrderDialog />', () => {
  const block = html`
    <${OrderDialog} state=${{ foo: 'bar' }} />
  `;

  expect(block).toMatchSnapshot();
});

test('it renders <OrderDialog /> with editing', () => {
  const block = html`
    <${OrderDialog}
      state=${{ foo: 'bar' }}
      isEdit
      fields=${{
        orderName: 'orderName',
        size: 'xl',
        ice: 'regular',
        sugar: 'half',
        ingredients: 'ingredients',
        price: 50,
      }}
    />
  `;

  expect(block).toMatchSnapshot();
});
