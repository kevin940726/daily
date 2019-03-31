const {
  html,
  Dialog,
  DialogSelect,
  DialogOption,
} = require('../../slack-block-kit');
const { ORDER_DRINK_DIALOG_CALLBACK_ID } = require('../constants');
const { mapSizeToLabel, mapIceToLabel, mapSugarToLabel } = require('../utils');

const OrderDialog = ({ state, fields = {}, isEdit = false }) => html`
  <${Dialog}
    callback_id=${ORDER_DRINK_DIALOG_CALLBACK_ID}
    title=${isEdit ? 'Edit your order' : 'Order your drink'}
    submit_label=${isEdit ? 'Save' : 'Order'}
    notify_on_cancel=${false}
    state=${JSON.stringify(state)}
  >
    <text label="Order Name" name="orderName" value=${fields.orderName} />
    <${DialogSelect} label="Size" name="size" value=${fields.size || 'l'}>
      ${['s', 'm', 'l', 'xl'].map(
        size => html`
          <${DialogOption} value=${size}>${mapSizeToLabel(size)}<//>
        `
      )}
    <//>
    <${DialogSelect} label="Ice" name="ice" value=${fields.ice || 'free'}>
      ${['regular', 'easy', 'free', 'hot'].map(
        ice => html`
          <${DialogOption} value=${ice}>${mapIceToLabel(ice)}<//>
        `
      )}
    <//>
    <${DialogSelect} label="Sugar" name="sugar" value=${fields.sugar || 'free'}>
      ${['regular', 'less', 'half', 'quarter', 'free'].map(
        sugar => html`
          <${DialogOption} value=${sugar}>${mapSugarToLabel(sugar)}<//>
        `
      )}
    <//>
    <text
      label="Ingredients"
      name="ingredients"
      hint="Or any additional note"
      optional
      value=${fields.ingredients}
    />
    <text
      label="Total Price"
      name="price"
      subtype="number"
      value=${fields.price}
    />
  <//>
`;

module.exports = OrderDialog;
