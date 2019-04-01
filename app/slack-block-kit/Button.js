function Button({ children, emoji, ...props }) {
  return {
    type: 'button',
    text: {
      type: 'plain_text',
      text: children.join(''),
      emoji,
    },
    ...props,
  };
}

module.exports = {
  Button,
};
