const suites = []
const stats = {
  passed: 0,
  failed: 0,
  tags: {}
}
const state = {
  state: undefined
}

const updateStats = () => {
  stats.passed = suites.reduce((sum, suite) => {
    sum += suite.tests.filter(test => test.state === 'passed').length
    return sum
  }, 0)
  stats.failed = suites.reduce((sum, suite) => {
    sum += suite.tests.filter(test => test.state === 'failed').length
    return sum
  }, 0)
  stats.tags = suites.reduce((aggTags, suite) => {
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
    const suite = suites.find(suite => suite.id === evt.id)
    if (suite) return

    const unfinishedSuites = suites.filter(suite => suite.state === undefined)
    // Finish running suites
    unfinishedSuites.map(suite => (suite.state = 'passed'))

    suites.push({
      t: evt.t,
      id: evt.id,
      title: evt.title,
      tags: evt.tags,
      state: undefined,
      tests: []
    })
  },

  addTestToSuite: (suiteId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    if (!suite) return

    const newTest = {
      t: evt.t,
      id: evt.id,
      title: evt.title,
      state: undefined,
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

    updateStats()
  },

  addStepToTest: (suiteId, testId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    if (!suite) return

    const test = suite.tests.find(test => test.id === testId)

    const step = {
      t: evt.t,
      actor: evt.actor,
      name: evt.humanizedName,
      args: evt.humanizedArgs,
      screenshot: evt.screenshot
    }
    test.steps.push(step)
    test.stepsReverse.splice(0, 0, step)
  },

  markTestPassed: (suiteId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    if (!suite) return

    const test = suite.tests.find(test => test.id === evt.id)
    test.state = 'passed'
  },

  markTestFailed: (suiteId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    suite.state = 'failed'

    const test = suite.tests.find(test => test.id === evt.id)
    test.state = 'failed'
    test.err = evt.err
    test.file = evt.file
    test.screenshot = evt.screenshot

    // Add an artificial step
    const step = {
      t: evt.t,
      actor: 'I',
      name: 'failed here',
      args: '',
      screenshot: evt.screenshot
    }
    test.steps.push(step)
    test.stepsReverse.splice(0, 0, step)
  },

  reset: () => {
    suites.length = 0
    state.state = undefined
  },

  stats: () => stats,

  state: () => state,

  startTestRun: () => {
    state.state = 'running'
  },

  endTestRun: () => {
    suites.forEach(suite => {
      if (!suite.state) {
        suite.state = 'aborted'
        suite.tests.forEach(test => {
          if (!test.state) test.state = 'aborted'
        })
      }
    })

    updateStats()

    state.state = undefined
  }
}
