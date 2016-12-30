let getConfig = require('codeceptjs/lib/command/utils').getConfig;
let getTestRoot = require('codeceptjs/lib/command/utils').getTestRoot;
let deepMerge = require('codeceptjs/lib/utils').deepMerge;
let Codecept = require('codeceptjs/lib/codecept');
let output = require('codeceptjs/lib/output');

let event = require('codeceptjs/lib/event');


function run(suite, test, options) {
  // TODO provide environment variables from outside (i. e. run the test in different environments)
  process.env.NODE_ENV = 'integration';

  // registering options globally to use in config
  process.profile = options.profile;
  let configFile = options.config;
  let codecept;

  let testRoot = getTestRoot(suite);
  let config = getConfig(testRoot, configFile);

  // May have been manipulated by test run (grep option set)
  config.mocha = {};

  // override config with options
  if (options.override) {
    config = deepMerge(config, JSON.parse(options.override));
  }
  try {
    console.log('Starting test run');

    codecept = new Codecept(config, options);

    codecept.init(testRoot, function (err) {
      if (err) throw new Error('Error while running bootstrap file :' + err);

      console.log('Loading tests');
      codecept.loadTests();
      console.log('Running tests');
      codecept.run(test);

    });
    return codecept;
  } catch (err) {
    output.print('');
    output.error(err.message);
    output.print('');
    output.print(output.colors.grey(err.stack.replace(err.message, '')));
  }
};

module.exports = {
  run
}
