<template>
  <div class="Testbook">
    <nav class="Testbook-navigation nav has-shadow">
      <div class="nav-left">
        <h1 class="nav-item title">
          <i class="fa fa-book"></i>
          &nbsp;
          <strong>
            &lt;testbook&gt;
          </strong>
        </h1>
      </div>

      <div class="nav-center">
          <a class="nav-item">
              <span class="u-passed">{{stats.passed}}</span>
              &nbsp;
              Passed
          </a>
          <a class="nav-item">
            <span class="u-failed">{{stats.failed}}</span>
            &nbsp;
            Failed
          </a>
          <a class="nav-item" v-if="state.state === 'running'">
            <i class="fa fa-refresh fa-spin"></i>
          </a>
      </div>

      <div class="nav-right">
        <a class="nav-item" v-if="state.state === undefined">
          <button class="button is-primary" type="button" v-on:click="runAllTests()">Run All</button>
        </a>
        <a class="nav-item">
          <button class="button is-secondary" type="button" v-on:click="stopTestRun()">
            <i class="fa fa-stop u-failed"></i>
            &nbsp;
            Stop
          </button>
        </a>
      </div>
    </nav>

    <section class="section" v-if="suites.length === 0" >

      <blockquote class="has-text-centered">
        <strong>
          No test results are yet available.
          <a href="#" v-on:click="runAllTests()">Start a test run now!</a>
        </strong>
      </blockquote>

    </section>

    <section class="section">
      <div class="container is-fluid">

        <div class="columns">
          <div class="column is-5">

            <aside class="menu">
              <div v-for="suite in suites">
                <p class="menu-label">
                  {{ suite.title }}
                </p>
                <ul class="menu-list" v-for="test in suite.tests">
                  <li>
                    <a v-bind:class="{ 'is-active': isSelectedTest(test) }" v-on:click="selectTest(test)">
                      <span class="u-passed" v-if="test.state === 'passed'">
                        <i class="fa fa-check"></i>
                      </span>
                      <span class="u-failed" v-if="test.state === 'failed'">
                        <i class="fa fa-times"></i>
                      </span>
                      <span class="u-warning" v-if="test.state === 'aborted'">
                        <i class="fa fa-unlink"></i>
                      </span>
                      <span v-if="test.state === undefined">
                        <i class="fa fa-refresh fa-spin"></i>
                      </span>

                      {{test.title}}
                    </a>

                      <ul v-if="isSelectedTest(test)">
                        <li>
                          {{ selectedTest.file }}

                          <button class="button is-secondary is-small pull-right" v-on:click="runTest(test)">
                            Run
                          </button>
                        </li>

                        <li v-if="selectedTest.err">
                          <div class="message is-danger">
                            <div class="message-body">
                              {{ selectedTest.err.message }}

                              {{ selectedTest.err.actual }}
                              {{ selectedTest.err.expected }}
                            </div>
                          </div>
                        </li>

                        <li class="Step" v-bind:class="{ 'Step--active': isSelectedStep(step) }"
                          v-for="step in selectedTest.stepsReverse"
                          v-on:click="selectStep(step)">
                          <span class="u-rel-time">
                            {{relativeTime(selectedTest, step)}}
                          </span>
                          <strong>
                            {{step.actor}} {{step.name}}
                          </strong>
                          <em>
                            {{step.args}}
                          </em>
                        </li>

                      </ul>

                  </li>
                </ul>
              </div>
            </aside>

          </div>
          <div class="column is-7 Step-preview">
            <img class="Step-screenshot" v-if="selectedStep" v-bind:src="screenshotUrl(selectedStep.screenshot)" alt="step screenshot">
          </div>
        </div>

      </div>
    </section>




  </div>
</template>

<script>
import suiteService from './suite-service'

export default {
  name: 'hello',
  sockets: {
    connect: function () {
      console.log('socket connected')
    },
    'codecept.start': function (evt) {
      evt.type = 'codecept.start'
      this.suiteName = evt.name
      suiteService.startTestRun()
    },
    'codecept.suite': function (evt) {
      evt.type = 'codecept.suite'
      suiteService.addSuiteFromEvent(evt)
    },
    'codecept.step': function (evt) {
      evt.type = 'codecept.step'
      suiteService.addStepToTest(evt.suiteId, evt.testId, evt)
    },
    'codecept.test': function (evt) {
      evt.type = 'codecept.test'
      suiteService.addTestToSuite(evt.suiteId, evt)
    },
    'codecept.pass': function (evt) {
      evt.type = 'codecept.pass'
      suiteService.markTestPassed(evt.suiteId, evt)
    },
    'codecept.fail': function (evt) {
      evt.type = 'codecept.fail'
      suiteService.markTestFailed(evt.suiteId, evt)
    },
    'codecept.finish_run': function (evt) {
      evt.type = 'codecept.finish_run'
      suiteService.endTestRun()
    }
  },
  data () {
    return {
      selectedStep: undefined,
      selectedTest: undefined,
      suiteName: undefined,

      state: suiteService.state(),
      suites: suiteService.suites(),
      stats: suiteService.stats()
    }
  },
  methods: {
    screenshotUrl: function (screenshot) {
      return `http://localhost:3000/screenshots/${screenshot}`
    },
    relativeTime: function (test, step) {
      return ((step.t - test.t) / 1000).toFixed(3)
    },
    selectStep: function (step) {
      if (this.isSelectedStep(step)) {
        this.selectedStep = undefined
      } else {
        this.selectedStep = step
      }
    },
    isSelectedStep: function (step) {
      return step === this.selectedStep
    },
    selectTest: function (test) {
      if (this.isSelectedTest(test)) {
        this.selectedTest = undefined
        this.selectedStep = undefined
      } else {
        this.selectedTest = test
      }
    },
    isSelectedTest: function (test) {
      return test === this.selectedTest
    },
    runAllTests: function () {
      this.selectedStep = undefined
      suiteService.reset()
      this.$socket.emit('cmd.run', {})
    },
    runTest: function (test) {
      this.stopTestRun()
      this.$socket.emit('cmd.run', { grep: test.title })
    },
    stopTestRun: function () {
      this.$socket.emit('cmd.stop', {})
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~bulma/sass/utilities/variables';

  .Testbook {
    margin-top: 3em;
  }

  .Testbook-navigation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }

  .Testbook-suites, .Testbook-tests {
    list-style-type: none;
  }

  .Testbook-screenshot {
    width: 320px;
    height: 200px;
    border: 1px solid #ccc;
  }

  .Suite-tags {
    margin-left: 25px;
  }
  .Suite-tag {
  }

  .Test-title {
  }

  .Steps {
    list-style-type: none;
    margin-left: 1em;
  }

  .Step {
    &--active {
      background-color: $grey;
    }
  }

  .Step:hover {
    cursor: pointer;
    background-color: $grey-lighter;
  }

  .Step-preview {
  }

  .Step-screenshot {
    position: fixed;
    top: 10em;
    margin-left: 1em;
  }

  .u-passed {
    color: $green;
  }

  .u-failed {
    color: $red;
  }

  .u-warning {
    color: $yellow;
  }

  .u-rel-time {
    display: inline-block;
    width: 5em;
    color: $grey-lighter;
  }
  .u-rel-time::before {
    content: 'at';
  }
  .u-rel-time::after {
    content: ' s';
  }
</style>
