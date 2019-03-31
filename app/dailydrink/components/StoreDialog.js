const { html, Dialog } = require('../../slack-block-kit');
const { CREATE_NEW_STORE_CALLBACK_ID } = require('../constants');

const StoreDialog = () =>
  html`
    <${Dialog}
      callback_id=${CREATE_NEW_STORE_CALLBACK_ID}
      title="Submit a new store"
      submit_label="Submit"
      notify_on_cancel=${false}
    >
      <text label="Store name" name="storeName" />
      <text label="Menu image URL" name="imageURL" subtype="url" />
    <//>
  `;

module.exports = StoreDialog;
