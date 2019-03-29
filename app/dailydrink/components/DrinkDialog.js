const { CREATE_NEW_ORDER_CALLBACK_ID } = require('../constants');

const DrinkDialog = ({ state }) => ({
  callback_id: CREATE_NEW_ORDER_CALLBACK_ID,
  title: 'Create a new order',
  submit_label: 'Create',
  notify_on_cancel: false,
  state: JSON.stringify(state),
  elements: [
    {
      type: 'text',
      label: 'Title',
      name: 'title',
      hint: 'Provide estimated due time if needed.',
      optional: true,
    },
    // {
    //   label: 'Post this message on',
    //   name: 'channels',
    //   type: 'select',
    //   data_source: 'conversations',
    //   hint: 'By default it will only post this on the current channel',
    //   optional: true,
    // },
  ],
});

module.exports = DrinkDialog;
