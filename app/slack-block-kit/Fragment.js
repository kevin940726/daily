function Fragment({ children }) {
  return [].concat(...children).filter(Boolean);
}

module.exports = Fragment;
