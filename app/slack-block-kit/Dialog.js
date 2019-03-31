function Dialog({ children, ...props }) {
  return {
    ...props,
    elements: children,
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
    ] = children;
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
    options: children,
  };
}

module.exports = {
  Dialog,
  DialogSelect,
  DialogOption,
  DialogOptionGroups,
};
