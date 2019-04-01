const { getAllStores } = require('../store');

const options = async ctx => {
  const stores = await getAllStores();

  ctx.status = 200;
  ctx.set('Content-Type', 'application/json');

  ctx.body = JSON.stringify({
    options: stores.map(store => ({
      label: store,
      value: store,
    })),
  });
};

module.exports = options;
