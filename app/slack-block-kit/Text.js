function Bold({ children }) {
  return `*${children.join('')}*`;
}

function Italic({ children }) {
  return `_${children.join('')}_`;
}

function Strike({ children }) {
  return `~${children.join('')}~`;
}

function Mrkdwn({ children, ...props }) {
  return {
    type: 'mrkdwn',
    text: children.join(''),
    ...props,
  };
}

function PlainText({ children, ...props }) {
  return {
    type: 'plain_text',
    text: children.join(''),
    ...props,
  };
}

function User({ children }) {
  return `<@${children.join('')}>`;
}

function Br() {
  return `\n`;
}

module.exports = {
  Bold,
  Italic,
  Strike,
  Mrkdwn,
  PlainText,
  User,
  Br,
};
