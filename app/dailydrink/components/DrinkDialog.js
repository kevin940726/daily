const {
  CREATE_NEW_ORDER_CALLBACK_ID,
  CHOOSE_STORE_SELECT,
} = require('../constants');

const DrinkDialog = ({ state = {}, isEdit = false, fields = {} }) => ({
  callback_id: CREATE_NEW_ORDER_CALLBACK_ID,
  title: isEdit ? 'Edit your order' : 'Start a new order',
  submit_label: isEdit ? 'Save' : 'Start',
  notify_on_cancel: false,
  state: JSON.stringify(state),
  elements: [
    {
      label: 'Store',
      name: CHOOSE_STORE_SELECT,
      type: 'select',
      data_source: 'external',
      hint:
        'Cannot find the store you are looking for? Try submit a new store via `/dailydrink submit`',
      selected_options: fields.store && [
        {
          label: fields.store.storeName,
          value: fields.store.storeName,
        },
      ],
    },
    {
      type: 'text',
      label: 'Title',
      name: 'title',
      hint: 'Provide estimated due time if needed.',
      optional: true,
      value: fields.title,
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
