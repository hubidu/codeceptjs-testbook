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

  init: (initialSuites) => {
    Object.assign(suites, initialSuites)
  },

  suites: () => {
    return suites
  },

  addSuiteFromEvent: (evt) => {
    // Finish any running suites now
    // TODO Implement this correctly (last suite will not be finished)
    const unfinishedSuites = suites[evt._device].filter(suite => suite.state === undefined)
    // Finish running suites
    unfinishedSuites.map(suite => (suite.state = 'passed'))

    const suite = suites[evt._device].find(suite => suite.id === evt.id)
    // Suite usually already exists
    if (suite) {
      // rerun suite -> state is undefined
      suite.state = undefined
      suite.t = evt.t
      suite.tags = evt.tags
      return
    }

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
      tags: evt.tags,
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
      state: undefined, // at this point step is probably still running
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
    test.steps.forEach(s => (s.state = 'passed'))
    test.steps.push(step)
    test.stepsReverse.forEach(s => (s.state = 'passed'))
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

    // TODO This is a HACK. Use test type property to distinguish hooks from real steps
    const step = {
      t: evt.t,
      actor: '>>> Before',
      name: '',
      args: '',
      humanizedArgs: '',
      humanizedName: ''
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

    // Make sure all tests are now green
    test.steps.forEach(s => (s.state = 'passed'))
  },

  markTestFailed: (suiteId, evt) => {
    const suite = suites[evt._device].find(suite => suite.id === suiteId)
    if (!suite) return
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
    test.screenshot = evt.screenshot // dont need that on the test (steps are supposed to have screenshots)

    // Mark last step as failed
    const failedStep = test.stepsReverse[0]
    failedStep.state = 'failed'
    failedStep.screenshot = evt.screenshot
    // NOTE htmlSource is not available in test failed so far
    // failedStep.htmlSource = evt.htmlSource
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
    stats.env.environment = evt._environment
    stats.env.device = evt._device
  },

  endTestRun: (evt) => {
    suites[evt._device].forEach(suite => {
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
