exports.mapLunchTextToSet = text => new Set(
  (text || '')
    .split(', ')
    .map(user => user.trim())
    .filter(Boolean)
);

exports.mapSetToLunchText = set => Array.from(set)
  .join(', ');
