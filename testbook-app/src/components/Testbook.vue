<template>
  <div class="Testbook">
    <nav class="nav">
      <div class="nav-left">
        <h1 class="nav-item">
          Codeceptjs Testbook
        </h1>
      </div>
      <span class="nav-item">
        <button class="button is-primary" type="button" v-on:click="runAllTests()">Run All</button>
      </span>
    </nav>

    <div class="columns">
      <div class="column is-5 content">

        <blockquote v-if="suites.length === 0" class="has-text-centered">
          <strong>
            No test results are yet available.
            <a href="#" v-on:click="runAllTests()">Start a test run now!</a>
          </strong>
        </blockquote>

        <h2 class="title">{{ suiteName }}</h2>

        <ul class="Testbook-suites">
          <li v-for="suite in suites">
            <h3>
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

              <div class="Suite-tags">
                <span class="Suite-tag tag is-dark is-small" v-for="tag in suite.tags">{{tag}}</span>
              </div>
            </h3>
            <ul class="Testbook-tests">
              <li v-for="test in suite.tests">
                <h5 class="Test-title">
                  <span class="u-passed" v-if="test.state === 'passed'">
                    &#10004;
                  </span>
                  <span class="u-failed" v-if="test.state === 'failed'">
                    &#x2717;
                  </span>
                  <span v-if="test.state === undefined">
                    <a class="button is-loading">...</a>
                  </span>

                  <span class="u-rel-time">
                    {{relativeTime(suite, test)}}
                  </span>
                  {{test.title}}
                </h5>

                <ul class="Steps">
                  <li class="Step" v-for="step in test.steps" v-on:click="selectStep(step)">
                    <span class="u-rel-time">
                      {{relativeTime(test, step)}}
                    </span>
                    <strong>
                      {{step.actor}} {{step.name}}
                    </strong>
                    <em>
                      {{step.args}}
                    </em>
                  </li>
                </ul>


                <div v-if="test.err">
                  <div class="message is-danger">
                    <div class="message-body">
                      {{ test.err.message }}
                      <img class="Testbook-screenshot" v-bind:src="screenshotUrl(test.screenshot)" alt="error screenshot">
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>

      </div>
      <div class="column is-7">
        <img class="Step-screenshot" v-if="selectedStep" v-bind:src="screenshotUrl(selectedStep.screenshot)" alt="step screenshot">
      </div>
    </div>


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
    }
  },
  data () {
    return {
      selectedStep: undefined,
      suiteName: undefined,
      suites: suiteService.suites()
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
      this.selectedStep = step
    },
    runAllTests: function () {
      this.selectedStep = undefined
      suiteService.reset()
      this.$socket.emit('cmd.run', {})
    }
  }
}
</script>

<style scoped>
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

  .Step {
  }

  .Step:hover {
    cursor: pointer;
    background-color: #eee;
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
  }
  .u-rel-time::before {
    content: 'at';
  }
  .u-rel-time::after {
    content: ' s';
  }
</style>
