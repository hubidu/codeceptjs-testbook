const suites = {
  mobile: [],
  desktop: []
}
const stats = {
  passed: 0,
  failed: 0,
  tags: {},
  env: {}
}
const state = {
  state: undefined
}

const updateStats = (device) => {
  stats.passed = suites[device].reduce((sum, suite) => {
    sum += suite.tests.filter(test => test.state === 'passed').length
    return sum
  }, 0)
  stats.failed = suites[device].reduce((sum, suite) => {
    sum += suite.tests.filter(test => test.state === 'failed').length
    return sum
  }, 0)
  stats.tags = suites[device].reduce((aggTags, suite) => {
    suite.tags.forEach(tag => {
      aggTags[tag] === undefined ? aggTags[tag] = [suite] : aggTags[tag].push(suite)
    }, aggTags)
    return aggTags
  }, {})
}

export default {
  suites: () => {
    return suites
  },

  addSuiteFromEvent: (evt) => {
    const suite = suites[evt._device].find(suite => suite.id === evt.id)
    if (suite) return

    const unfinishedSuites = suites[evt._device].filter(suite => suite.state === undefined)
    // Finish running suites
    unfinishedSuites.map(suite => (suite.state = 'passed'))

    suites[evt._device].push({
      t: evt.t,
      id: evt.id,
      title: evt.title,
      tags: evt.tags,
      state: undefined,
      tests: []
    })
  },

  addTestToSuite: (suiteId, evt) => {
    const suite = suites[evt._device].find(suite => suite.id === suiteId)
    if (!suite) return

    const newTest = {
      t: evt.t,
      id: evt.id,
      title: evt.title,
      state: undefined,
      errorMessage: undefined,
      err: undefined,
      screenshot: undefined,
      file: evt.file,
      steps: [],
      stepsReverse: []
    }

    let test = suite.tests.find(test => test.id === evt.id)
    if (test) {
      test = Object.assign(test, newTest)
    } else {
      suite.tests.push(newTest)
    }

    updateStats(evt._device)
  },

  addStepToTest: (suiteId, testId, evt) => {
    const suite = suites[evt._device].find(suite => suite.id === suiteId)
    if (!suite) return

    const test = suite.tests.find(test => test.id === testId)
    if (!test) {
      console.error('Failed to find test', evt)
      return
    }

    const step = {
      t: evt.t,
      actor: evt.actor,
      name: evt.name,
      humanizedName: evt.humanizedName,
      args: evt.args,
      humanizedArgs: evt.humanizedArgs,
      screenshot: evt.screenshot,
      htmlSource: evt.htmlSource,
      pageTitle: evt.pageTitle,
      pageUrl: evt.pageUrl,
      file: evt.file,
      fileName: evt.fileName,
      lineNo: evt.lineNo,
      method: evt.method
    }
    test.steps.push(step)
    test.stepsReverse.splice(0, 0, step)
  },

  markTestStart: (suiteId, testId, evt) => {
    const suite = suites[evt._device].find(suite => suite.id === suiteId)
    if (!suite) return

    const test = suite.tests.find(test => test.id === testId)
    if (!test) {
      console.error('Failed to find test', evt)
      return
    }

    const step = {
      t: evt.t,
      actor: '---',
      name: '',
      args: ''
    }
    test.steps.push(step)
    test.stepsReverse.splice(0, 0, step)
  },

  markTestPassed: (suiteId, evt) => {
    const suite = suites[evt._device].find(suite => suite.id === suiteId)
    if (!suite) return

    const test = suite.tests.find(test => test.id === evt.id)
    if (!test) {
      console.error('Failed to find test', evt)
      return
    }
    test.state = 'passed'
  },

  markTestFailed: (suiteId, evt) => {
    const suite = suites[evt._device].find(suite => suite.id === suiteId)
    suite.state = 'failed'

    const test = suite.tests.find(test => test.id === evt.id)
    if (!test) {
      console.error('Failed to find test', evt)
      return
    }
    test.state = 'failed'
    test.errorMessage = evt.errorMessage
    test.err = evt.err
    test.file = evt.file
    test.screenshot = evt.screenshot

    // Mark last step as failed
    const failedStep = test.stepsReverse[0]
    failedStep.state = 'failed'
    failedStep.screenshot = evt.screenshot
    failedStep.htmlSource = evt.htmlSource

    // Add an artificial step
    // const step = {
    //   t: evt.t,
    //   actor: 'I',
    //   humanizedName: 'failed here',
    //   args: '',
    //   screenshot: evt.screenshot,
    //   htmlSource: evt.htmlSource,
    //   pageUrl: undefined,
    //   pageTitle: undefined
    // }
    // test.steps.push(step)
    // test.stepsReverse.splice(0, 0, step)
  },

  reset: () => {
    suites.mobile.length = 0
    suites.desktop.length = 0
    state.state = undefined
    updateStats('desktop')
    updateStats('mobile')
  },

  stats: () => stats,

  state: () => state,

  startTestRun: (evt) => {
    state.state = 'running'
    stats.env.environment = evt.environment
    stats.env.device = evt.device
  },

  endTestRun: (evt) => {
    suites[evt.device].forEach(suite => {
      if (!suite.state) {
        suite.state = 'aborted'
        suite.tests.forEach(test => {
          if (!test.state) test.state = 'aborted'
        })
      }
    })

    updateStats(evt._device)

    state.state = undefined
  }
}
