const { getDrinkOrderData } = require('../store');
const { respondMessage } = require('../slack');
const Drink = require('./components/Drink');

module.exports = async (messageID, responseURL) => {
  const messageData = await getDrinkOrderData(messageID);

  messageData.orders = Object.values(messageData.orders).sort(
    (a, b) => a.updateTimestamp - b.updateTimestamp
  );

  return respondMessage(responseURL, {
    response_type: 'in_channel',
    blocks: Drink(messageData),
  });
};
