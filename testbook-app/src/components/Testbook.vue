<template>
  <div class="Testbook">
    <nav class="nav has-shadow">
      <div class="nav-left">
        <h1 class="nav-item title">
          <strong>
            codeceptjs
          </strong>
          &nbsp;
          Testbook
        </h1>
      </div>
      <span class="nav-item">
        <button class="button is-primary" type="button" v-on:click="runAllTests()">Run All</button>
      </span>
    </nav>

    <nav class="level" v-if="suites.length > 0">
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Passed</p>
          <p class="title">{{stats.passed}}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Failed</p>
          <p class="title">{{stats.failed}}</p>
        </div>
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
                  <span class="u-passed" v-if="suite.state === 'passed'">
                    &#10004;
                  </span>
                  <span class="u-failed" v-if="suite.state === 'failed'">
                    &#x2717;
                  </span>
                  <span v-if="suite.state === undefined">
                    <a class="button is-loading">...</a>
                  </span>

                  {{ suite.title }}
                </p>
                <ul class="menu-list" v-for="test in suite.tests">
                  <li>
                    <a v-bind:class="{ 'is-active': isSelectedTest(test) }" v-on:click="selectTest(test)">
                      <span class="u-passed" v-if="test.state === 'passed'">
                        &#10004;
                      </span>
                      <span class="u-failed" v-if="test.state === 'failed'">
                        &#x2717;
                      </span>
                      <span v-if="test.state === undefined">
                        <a class="button is-loading">...</a>
                      </span>

                      {{test.title}}
                    </a>

                      <ul v-if="isSelectedTest(test)">
                        <li v-if="selectedTest.err">
                          <div class="message is-danger">
                            <div class="message-body">
                              {{ selectedTest.err.message }}
                              <img class="Testbook-screenshot" v-bind:src="screenshotUrl(selectedTest.screenshot)" alt="error screenshot">
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
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~bulma/sass/utilities/variables';

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
    color: green;
  }

  .u-failed {
    color: red;
  }

  .u-rel-time {
    display: inline-block;
    width: 5em;
    color: #ccc;
  }
  .u-rel-time::before {
    content: 'at';
  }
  .u-rel-time::after {
    content: ' s';
  }
</style>
