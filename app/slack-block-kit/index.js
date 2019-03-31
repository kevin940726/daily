const htm = require('htm');
const components = require('./components');

function createBlock(type, props, ...children) {
  if (typeof type === 'function') {
    return type({ ...props, children });
  } else if (type === '') {
    return [].concat(...children);
  } else if (type === 'br') {
    return `\n`;
  } else if (type === 'b') {
    return `*${children.join('')}*`;
  } else if (type === 'i') {
    return `_${children.join('')}_`;
  } else if (type === 's') {
    return `~${children.join('')}~`;
  }

  return {
    type,
    ...props,
  };
}

const html = htm.bind(createBlock);

module.exports = {
  html,
  createBlock,
  ...components,
};
