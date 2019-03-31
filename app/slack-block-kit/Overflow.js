const Fragment = require('./Fragment');

function Overflow({ children, ...props }) {
  return {
    type: 'overflow',
    ...props,
    options: Fragment({ children }),
  };
}

function Option({ children, value, ...props }) {
  return {
    text: {
      type: 'plain_text',
      text: children.join(''),
      ...props,
    },
    value,
  };
}

function OptionGroups({ label, children, ...props }) {
  return {
    label: {
      type: 'plain_text',
      text: label.join(''),
      ...props,
    },
    options: Fragment({ children }),
  };
}

module.exports = {
  Overflow,
  Option,
  OptionGroups,
};
