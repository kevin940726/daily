const { ORDER_DRINK_DIALOG_CALLBACK_ID } = require('../constants');

const OrderDialog = ({ state, fields = {}, isEdit = false }) => ({
  callback_id: ORDER_DRINK_DIALOG_CALLBACK_ID,
  title: isEdit ? 'Edit your order' : 'Order your drink',
  submit_label: isEdit ? 'Edit' : 'Order',
  notify_on_cancel: false,
  state: JSON.stringify(state),
  elements: [
    {
      type: 'text',
      label: 'Order Name',
      name: 'orderName',
      value: fields.orderName,
    },
    {
      label: 'Size',
      name: 'size',
      type: 'select',
      value: fields.size || 'l',
      options: [
        {
          label: 'Small',
          value: 's',
        },
        {
          label: 'Medium',
          value: 'm',
        },
        {
          label: 'Large',
          value: 'l',
        },
        {
          label: 'Extra Large',
          value: 'xl',
        },
      ],
    },
    {
      label: 'Ice',
      name: 'ice',
      type: 'select',
      value: fields.ice || 'free',
      options: [
        {
          label: 'Regular Ice',
          value: 'regular',
        },
        {
          label: 'Easy Ice',
          value: 'easy',
        },
        {
          label: 'Ice-free',
          value: 'free',
        },
        {
          label: 'Hot',
          value: 'hot',
        },
      ],
    },
    {
      label: 'Sugar',
      name: 'sugar',
      type: 'select',
      value: fields.sugar || 'free',
      options: [
        {
          label: 'Regular Sugar',
          value: 'regular',
        },
        {
          label: 'Less Sugar',
          value: 'less',
        },
        {
          label: 'Half Sugar',
          value: 'half',
        },
        {
          label: 'Quarter Sugar',
          value: 'quarter',
        },
        {
          label: 'Sugar-free',
          value: 'free',
        },
      ],
    },
    {
      label: 'Ingredients',
      name: 'ingredients',
      type: 'text',
      optional: true,
      value: fields.ingredients,
      hint: 'Or any additional note',
    },
    {
      label: 'Total Price',
      name: 'price',
      type: 'text',
      subtype: 'number',
      value: fields.price,
    },
  ],
});

module.exports = OrderDialog;
