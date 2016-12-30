<template>
  <div class="Testbook">
    <div>
      <button type="button" v-on:click="runAllTests()">Run</button>
    </div>

    <h1>Codeceptjs Testbook</h1>
    <hr>

    <img class="Step-screenshot" v-if="selectedStep" v-bind:src="screenshotUrl(selectedStep.screenshot)" alt="step screenshot">


    <div v-if="suites.length === 0">
      No test results are yet available.
      <a href="#" v-on:click="runAllTests()">Start a test run now!</a>
    </div>

    <h2>{{ suiteName }}</h2>

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
            ...
          </span>

          {{ suite.title }}

          <div class="Suite-tags">
            <span class="Suite-tag" v-for="tag in suite.tags">{{tag}}</span>
          </div>
        </h3>
        <ul class="Testbook-tests">
          <li v-for="test in suite.tests">
            <h4 class="Test-title">
              <span class="u-passed" v-if="test.state === 'passed'">
                &#10004;
              </span>
              <span class="u-failed" v-if="test.state === 'failed'">
                &#x2717;
              </span>
              <span v-if="test.state === undefined">
                ...
              </span>

              <span class="u-rel-time">
                {{relativeTime(suite, test)}}
              </span>
              {{test.title}}
            </h4>

            <ul class="Steps">
              <li class="Step" v-for="step in test.steps" v-on:click="selectStep(step)">
                <span class="u-rel-time">
                  {{relativeTime(test, step)}}
                </span>
                {{step.actor}} {{step.name}}
                <em>
                  {{step.args}}
                </em>
              </li>
            </ul>


            <div v-if="test.err">
              <pre>
                <code>
                  {{ test.err.message }}
                </code>
              </pre>
              <img class="Testbook-screenshot" v-bind:src="screenshotUrl(test.screenshot)" alt="error screenshot">
            </div>
          </li>
        </ul>
      </li>
    </ul>
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

  .Suite-tag {
    font-size: 0.6em;
    font-weight: normal;
    padding: 3px;
    margin-right: 5px;
    background-color: #888;
    color: white;
  }

  .Test-title {
    color: #888;
    font-weight: normal;
    margin-top: 5px;
    margin-bottom: 0;
  }

  .Step {
    font-size: 0.9em;
    color: #aaa;
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
    width: 6em;
    font-size: 0.6em;
    color: #bbb;
  }
  .u-rel-time::before {
    content: 'at';
  }
  .u-rel-time::after {
    content: ' s';
  }
</style>
