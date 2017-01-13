const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const fsPath = require('path');

// NOTE Need to load the same event module instance than the running codeceptjs inst
// in order to get the step events
const TEST_ROOT = process.cwd();
const event = require(fsPath.join(TEST_ROOT, 'node_modules/codeceptjs/lib/event'));
const utils = require(fsPath.join(TEST_ROOT, 'node_modules/codeceptjs/lib/command/utils'));

let AssertionFailedError = require('codeceptjs/lib/assert/error');

// TODO Move that to config
const OUTPUT_DIR = './.testbook';
mkdirp(OUTPUT_DIR);

/**
 * Send event data to subscribers
 */
function log(evtName, evt = {}) {
  const args = Array.prototype.slice.call(arguments);

  console.log(evtName, JSON.stringify(evt));
}

/**
 * MD5 hash a string
 */
function hash(str) {
  var crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest("hex");
}

/**
 * Extract tags from the given string and remove them
 */
function parseTags(str) {
  let tags = str.match(/(@\w+\W)/g) || [];
  tags= tags.map(t => t.trim()).map(t => t.replace('@', ''));

  let title = str;
  tags.forEach(t => (title = title.replace(`@${t}`, '')));

  return {
    tags,
    originalTitle: str,
    title
  }
}

/**
 * The test title could contain tags (denoted by @).
 */
function parseTestTitle(title) {
  return Object.assign({
    id: hash(title),
  }, parseTags(title));
}

function parseSuiteTitle(title) {
  return Object.assign({ id: hash(title) }, parseTags(title));
}

/**
 * The step title could contain tags (denoted by @)
 */
function mapStep(step) {
  return {
    t: Date.now(),
    name: step.name,
    args: step.args,
    humanizedName: step.humanize(),
    humanizedArgs: step.humanizeArgs(),
    helper: step.helper.constructor.name,
    actor: step.actor,
    screenshot: step.screenshot
  }
}

function saveCurrentScreenshot(stepScreenshot, suiteId, testId) {
  function currentScreenshot() {
    return path.join(global.output_dir, stepScreenshot);
  }

  const screenshot = `${suiteId}-${testId}-${Date.now()}.current.png`;
  try {
    if (fs.existsSync(currentScreenshot())) {
      fs.renameSync(currentScreenshot(), path.join(OUTPUT_DIR, screenshot));
      return screenshot;
    }
  } catch (err) {
    console.log(`Failed to rename current screenshot file ${err}`);
  }
  return undefined;
}

/**
 * Strip current working directory from file path
 * @param  {[type]} filePath [description]
 * @return {[type]}          [description]
 */
function stripCwd(filePath) {
  return filePath.replace(process.cwd(), '');
}

/**
 * Create a mocha runner instance which listens for test events
 * and passes them to a websocket
 */
function reporterFactoryFn(runner, opts) {
  let currentSuite;
  let currentTest;

  runner.on('start', function () {
    const config = utils.getConfig(TEST_ROOT, undefined);
    currentSuite = undefined;
    log('codecept.start', Object.assign({}, {
      name: config.name
    }));
  });

  runner.on('suite', function (suite) {
    if (suite.fullTitle() === '') return; // ignore root suite
    currentSuite = suite;
    currentTest = undefined;
    log('codecept.suite', Object.assign({
      t: Date.now(),
    }, parseSuiteTitle(suite.fullTitle())));
  });

  event.dispatcher.on('test.before', function (step) {
  });

  event.dispatcher.on('step.before', function (step) {
    const suiteId = hash(currentSuite.fullTitle());
    const testId = hash(currentTest.title);

    log('codecept.step', Object.assign({
      suiteId,
      testId
    }, mapStep(step)));
  });

  runner.on('fail', function (test, err) {
    function codeceptErrorScreenshot(test) {
      return path.join(global.output_dir, test.title.replace(/ /g, '_') + '.failed.png');
    }

    let screenshot;
    try {
      screenshot =  `${hash(currentSuite.fullTitle())}-${hash(test.title)}-${Date.now()}.failed.png`;
      if (fs.existsSync(codeceptErrorScreenshot(test))) {
        fs.renameSync(codeceptErrorScreenshot(test), path.join(OUTPUT_DIR, screenshot));
      }
    } catch (err) {
      console.log(`Failed to rename screenshot file ${err}`);
    }

    if (err instanceof AssertionFailedError) {
      err.message = err.cliMessage();

      log('codecept.fail', Object.assign({
        t: Date.now(),
        err: {
          message: err.message,
          stack: err.stack,
          actual: err.actual,
          expected: err.expected,
        },
        steps: test.steps.map(step => ({ name: step.name })),
        screenshot: screenshot,
        file: stripCwd(test.file),
        suiteId: hash(currentSuite.fullTitle())
      }, parseTestTitle(test.title)));
    } else {
      log('codecept.fail', Object.assign({
        t: Date.now(),
        err: {
          message: err.message,
          stack: err.stack,
        },
        steps: test.steps.map(step => ({ name: step.name })),
        screenshot: screenshot,
        file: test.file,
        suiteId: hash(currentSuite.fullTitle())
      }, parseTestTitle(test.title)));
    }
  });

  runner.on('pending', function (test) {
    log('codecept.pending', Object.assign({
      t: Date.now(),
      file: test.file,
      steps: test.steps.map(step => ({ name: step.name })),
      suiteId: hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)));
  });

  runner.on('pass', function (test) {
    log('codecept.pass', Object.assign({
      t: Date.now(),
      file: test.file,
      steps: test.steps.map(step => ({ name: step.name })),
      suiteId: hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)));
  });

  runner.on('test', function (test) {
    currentTest = test;
    log('codecept.test', Object.assign({
      t: Date.now(),
      file: test.file,
      steps: test.steps.map(step => ({ name: step.name })),
      suiteId: hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)));
  });

  runner.on('end', () => {
    log('codecept.end', {});
  });

  return runner;
}

module.exports = reporterFactoryFn;
