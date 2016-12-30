let Helper = codecept_helper;

const fs = require('fs');
const path = require('path');

let counter = 0;

class ScreenshotSaverHelper extends Helper {

  /**
   * Hook executed before each step
   *
   * @param step
   */
  _beforeStep(step) {
    try {
      counter++;
      const screenshotPath = `screenshot-${counter}.current.png`;
      step.screenshot = screenshotPath;
      return this.helpers['WebDriverIO']
        .saveScreenshot(screenshotPath)
        .then(() => {
          // TODO Move that to config
          const OUTPUT_DIR = './.testbook';
          fs.renameSync(path.join(global.output_dir, step.screenshot), path.join(OUTPUT_DIR, step.screenshot));
        })
        .catch(err => {
          console.log('ERROR in ScreenshotSaverHelper', err);
        });
    } catch(err) {
      console.log('ERROR in ScreenshotSaverHelper', err);
    }
  }
}

module.exports = ScreenshotSaverHelper;
