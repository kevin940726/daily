const {
  html,
  Dialog,
  DialogSelect,
  DialogOption,
} = require('../../slack-block-kit');
const {
  CREATE_NEW_ORDER_CALLBACK_ID,
  CHOOSE_STORE_SELECT,
} = require('../constants');

const DrinkDialog = ({ state = {}, isEdit = false, fields = {} }) => html`
  <${Dialog}
    callback_id=${CREATE_NEW_ORDER_CALLBACK_ID}
    title=${isEdit ? 'Edit your order' : 'Start a new order'}
    submit_label=${isEdit ? 'Save' : 'Start'}
    notify_on_cancel=${false}
    state=${JSON.stringify(state)}
  >
    <${DialogSelect}
      label="Store"
      name=${CHOOSE_STORE_SELECT}
      data_source="external"
      hint="Cannot find the store you are looking for? Try submit a new store via \`/dailydrink submit\`"
      selected_options=${fields.store &&
        html`
      <>
        <${DialogOption} value=${fields.store.storeName}>${
          fields.store.storeName
        }<//>
      </>
    `}
    />
    <text
      label="Title"
      name="title"
      hint="Provide estimated due time if needed."
      optional
      value=${fields.title}
    />
    ${false && // TODO, ...or not
      html`
        <${DialogSelect}
          label="Post this message on"
          name="channels"
          data_source="conversations"
          hint="By default it will only post this on the current channel"
          optional
        />
      `}
  <//>
`;

module.exports = DrinkDialog;
