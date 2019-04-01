const { html } = require('../../../slack-block-kit');
const DrinkDialog = require('../DrinkDialog');

test('it renders <DrinkDialog />', () => {
  const block = html`
    <${DrinkDialog} state=${{ foo: 'bar' }} />
  `;

  expect(block).toMatchSnapshot();
});

test('it renders <DrinkDialog /> with editing', () => {
  const block = html`
    <${DrinkDialog}
      state=${{ foo: 'bar' }}
      isEdit
      fields=${{
        store: {
          storeName: 'storeName',
          imageURL: 'imageURL',
        },
        title: 'title',
      }}
    />
  `;

  expect(block).toMatchSnapshot();
});
