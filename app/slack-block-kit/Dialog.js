const Fragment = require('./Fragment');

function Dialog({ children, ...props }) {
  return {
    ...props,
    elements: Fragment({ children }),
  };
}

function DialogSelect({ children, ...props }) {
  const block = {
    type: 'select',
    ...props,
  };

  if (children.length) {
    block[
      children.every(child => !!child.label) ? 'option_groups' : 'options'
    ] = Fragment({ children });
  }

  return block;
}

function DialogOption({ children, ...props }) {
  return {
    ...props,
    label: children.join(''),
  };
}

function DialogOptionGroups({ children, ...props }) {
  return {
    ...props,
    options: Fragment({ children }),
  };
}

module.exports = {
  Dialog,
  DialogSelect,
  DialogOption,
  DialogOptionGroups,
};
