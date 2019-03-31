const { html } = require('../../../slack-block-kit');
const StoreDialog = require('../StoreDialog');

test('it renders <StoreDialog />', () => {
  const block = html`
    <${StoreDialog} />
  `;

  expect(block).toMatchSnapshot();
});
