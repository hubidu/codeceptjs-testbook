const testrun = require('./testrun');

let counter = 0;

module.exports = {
  /**
   * Move the screenshot from the codecept output dir to the testrun directory
   */
  moveToTestrunDirectory: (screenshotFileName) => {
    fs.renameSync(path.join(global.output_dir, screenshotFileName), path.join(testrun.outputDir(), screenshotFileName));
  },

  /**
   * Create a unique screenshot name per step
   */
  createUniqueScreenshotName: () => {
    counter++;
    return `screenshot-${counter}.current.png`;
  }
}
