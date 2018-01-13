const chalk = require('chalk');

const logger = {};

const defaultConfig = {
  color: 'bgGreen.white',
  format: value => ` ${value} `,
};

const levels = [
  {
    method: 'log',
    color: 'bgGreen.white',
    format: value => ` ✔️  ${value} `,
  },
  {
    method: 'error',
    color: 'bgRed.bold',
    format: value => ` ❎  ${value} `,
  },
  {
    method: 'warn',
    color: 'bgYellow.black',
    format: value => ` ⚠️  ${value} `,
  },
  'info',
];

levels.forEach((level) => {
  const levelConfig = typeof level === 'string' ? {
    method: level,
    ...defaultConfig,
  } : level;

  logger[levelConfig.method] = (label, data) => {
    console.log(
      chalk`{${levelConfig.color} ${levelConfig.format(label)}}`
    );

    if (data) {
      console.log(
        chalk`{${levelConfig.color} ${levelConfig.format(label)}}`
      );
    }
  };
});

module.exports = logger;
