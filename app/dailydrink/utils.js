exports.mapSizeToLabel = size =>
  ({
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
  }[size]);

exports.mapIceToLabel = ice =>
  ({
    regular: 'Regular Ice',
    easy: 'Easy Ice',
    free: 'Ice-free',
    hot: 'Hot',
  }[ice]);

exports.mapSugarToLabel = sugar =>
  ({
    regular: 'Regular Sugar',
    less: 'Less Sugar',
    half: 'Half Sugar',
    quarter: 'Quarter Sugar',
    free: 'Sugar-free',
  }[sugar]);
