const suites = []

export default {
  suites: () => {
    return suites
  },

  addSuiteFromEvent: (evt) => {
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
    suite.tests.push({
      t: evt.t,
      id: evt.id,
      title: evt.title,
      state: undefined,
      err: undefined,
      screenshot: undefined,
      steps: []
    })
  },

  addStepToTest: (suiteId, testId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    const test = suite.tests.find(test => test.id === testId)

    test.steps.push({
      t: evt.t,
      actor: evt.actor,
      name: evt.humanizedName,
      args: evt.humanizedArgs,
      screenshot: evt.screenshot
    })
  },

  markTestPassed: (suiteId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    const test = suite.tests.find(test => test.id === evt.id)
    test.state = 'passed'
  },

  markTestFailed: (suiteId, evt) => {
    const suite = suites.find(suite => suite.id === suiteId)
    suite.state = 'failed'

    const test = suite.tests.find(test => test.id === evt.id)
    test.state = 'failed'
    test.err = evt.err
    test.screenshot = evt.screenshot
  },

  reset: () => {
    suites.length = 0
  }
}
