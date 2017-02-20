<template>
  <div class="Testbook">
    <navigation
      :stats="stats"
      :state="state"
      v-on:testrun-continuously="runContinuously()"
      v-on:testrun-start="startTestrun()"
      v-on:testrun-stop="stopTestrun()"
    >
    </navigation>

    <tags :tags="stats.tags"></tags>

    <div class="Testbook-features">
            <blockquote class="TestbookFeatures--emptyState has-text-centered" v-if="suites[selectedDevice].length === 0">
              No test results are yet available.
              <a v-on:click="startTestrun()">Start a test run now!</a>
            </blockquote>

            <aside>

              <div class="TestbookFeature box content"
                  v-bind:class="{'TestbookFeature--passed': suite.state === 'passed', 'TestbookFeature--failed': suite.state === 'failed'}"
                  v-for="suite in suites[selectedDevice]"
              >
                <div class="TestbookFeatureInfo">
                  <span class="TestbookFeatureInfo-lastRun">{{ suite.t | toTime }}</span>
                  &middot;
                  <a
                    v-on:click="runSuite(suite)"
                  >
                    Run
                  </a>
                </div>


                <h5 class="title" v-html="formatMarkdown(suite.title)">
                </h5>

                <ul v-for="test in suite.tests">
                  <li>
                    <div class="TestbookTest" v-bind:class="{ 'is-active': isSelectedTest(test) }" v-on:click="selectTest(test)">
                      <span class="TestbookTest-icon">
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
                        <span v-if="test.state === 'not-run'">
                          <i class="fa fa-square-o"></i>
                        </span>
                      </span>
                      <h6 class="TestbookTest-title" v-html="formatMarkdown(test.title)"></h6>

                    </div>

                      <ul class="Testbook-steps" v-if="isSelectedTest(test)">
                        <li>
                          <div class="Testbook-step_cmdbar">
                            {{ test.file }}

                            <a class="pull-right" v-on:click="runSingleTest(test)">
                              Run
                            </a>

                            <span class="pull-right">{{ test.t | toTime }}&nbsp;&middot;&nbsp;</span>
                          </div>
                        </li>

                        <li v-if="test.errorMessage">
                          <div class="notification is-danger">
                            {{ test.errorMessage }}
                          </div>

                          <div v-if="test.err && test.err.message">

                            <div class="u-expected" v-if="test.err.expected">

                                <strong class="u-expected">Expected</strong>
                                {{ test.err.expected }}

                            </div>
                            <div class="u-actual" v-if="test.err.actual">

                                <strong class="u-actual">Actual</strong>
                                {{ test.err.actual }}

                            </div>

                          </div>
                        </li>

                        <li class="Step"
                          v-bind:class="{ 'Step--active': isSelectedStep(step), 'Step--failed': step.state === 'failed', 'Step--inprogress': step.state === undefined, 'Step--passed': step.state === 'passed' && step.name !== 'comment' }"
                          v-for="step in test.stepsReverse"
                          v-on:click="selectStep(step)"
                        >
                          <step :step="step" :is-selected="isSelectedStep(step)" ></Step>
                        </li>

                      </ul>

                  </li>
                </ul>
              </div>
            </aside>

    </div>

    <div class="Step-preview">

      <section class="TestbookDeviceSelection" v-if="suites[selectedDevice].length > 0">
      <div class="tabs is-centered is-boxed">
        <ul>
          <li v-for="(device, deviceName) in config.devices" v-bind:class="{ 'is-active': selectedDevice === device }">
            <a v-on:click="selectDevice(deviceName)">
              <span class="icon is-small"><i class="fa fa-desktop"></i></span>
              <span>{{ deviceName }}</span>
            </a>
          </li>
        </ul>
      </div>
      </section>


      <div v-if="foo() !== undefined">
        <h2 class="title">{{foo().pageTitle}}</h2>
        <div>
          <a target="_blank" v-show="foo().htmlSource" v-bind:href="htmlSourceUrl(foo())">
            View HTML
          </a>
        </div>

        <a
          target="_blank"
          v-show="foo().pageUrl"
          v-bind:href="foo().pageUrl">
          <input class="input" type="text" placeholder="The url" v-bind:value="foo().pageUrl" disabled>
        </a>

        <hr>
        <img
          v-show="foo().screenshot"
          class="Step-screenshot"
          v-bind:src="screenshotUrl(foo().screenshot)"
          alt="step screenshot">

        <pre>
          <code>
            {{foo().pageSource}}
          </code>
        </pre>
      </div>
    </div>

  </div>
</template>

<script>
import marked from 'marked'
import suiteService from './suite-service'
import urlHelpers from './url-helpers'

import Navigation from './Navigation.vue'
import Step from './Step.vue'
import Tags from './Tags.vue'

export default {
  name: 'testbook',
  components: {
    Navigation,
    Step,
    Tags
  },
  sockets: {
    connect: function () {
      // TODO Store connection status so we can display in UI
      console.log('socket connected')
    },
    'testbook.config': function (evt) {
      this.config = Object.assign(this.config, evt)
    },
    'testbook.suites': function (evt) {
      suiteService.init(evt)
    },
    'codecept.start_run': function (evt) {
      evt.type = 'codecept.start_run'
      // this.suiteName = evt.name
      suiteService.startTestRun(evt)
    },
    'codecept.suite': function (evt) {
      evt.type = 'codecept.suite'
      suiteService.addSuiteFromEvent(evt)
    },
    'codecept.step': function (evt) {
      evt.type = 'codecept.step'
      suiteService.addStepToTest(evt.suiteId, evt.testId, evt)
    },
    'codecept.test.start': function (evt) {
      evt.type = 'codecept.test.start'
      suiteService.markTestStart(evt.suiteId, evt.testId, evt)
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
      suiteService.endTestRun(evt)
    }
  },
  data () {
    return {
      config: {},
      selection: {
        desktop: {
          selectedStep: undefined,
          tests: []
        },
        mobile: {
          selectedStep: undefined,
          tests: []
        },
        tablet: {
          selectedStep: undefined,
          tests: []
        }
      },
      selectedDevice: 'desktop',
      suiteName: undefined,

      state: suiteService.state(),
      suites: suiteService.suites(),
      stats: suiteService.stats()
    }
  },
  methods: {
    formatMarkdown: marked,

    screenshotUrl: urlHelpers.screenshotUrl,
    htmlSourceUrl: urlHelpers.htmlSourceUrl,

    relativeTime: function (test, step) {
      return ((step.t - test.t) / 1000).toFixed(3)
    },

    selectDevice: function (deviceName) {
      this.selectedDevice = deviceName
    },
    selectStep: function (step) {
      this.selection[this.selectedDevice].selectedStep = step
    },
    isSelectedStep: function (step) {
      return this.selection[this.selectedDevice].selectedStep === step
    },
    foo: function () {
      const selectedStep = this.selection[this.selectedDevice].selectedStep
      return selectedStep
    },
    selectTest: function (test) {
      const selectedTests = this.selection[this.selectedDevice].tests
      if (this.isSelectedTest(test)) {
        selectedTests.splice(selectedTests.indexOf(test), 1)
      } else {
        selectedTests.push(test)
      }
    },
    isSelectedTest: function (test) {
      const selectedTests = this.selection[this.selectedDevice].tests
      return selectedTests.indexOf(test) >= 0
    },

    runContinuously: function () {
      this.$socket.emit('cmd.run-continuously', {})
    },
    startTestrun: function () {
      this.selectedStep = undefined
      this.$socket.emit('cmd.run', {})
    },
    runSuite: function (suite) {
      this.stopTestrun()

      suite.state = undefined
      this.$socket.emit('cmd.run', { suite: suite.title })
    },
    runSingleTest: function (test) {
      this.stopTestrun()

      test.state = undefined
      this.$socket.emit('cmd.run', { grep: test.title })
    },
    stopTestrun: function () {
      this.$socket.emit('cmd.stop', {})
    }
  },

  filters: {
    truncate: function (string, value) {
      return string.substring(0, value) + '...'
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

  .TestbookTag {
    cursor: pointer;
    margin-top: 40px;
    margin-left: .5em;
    border: 1px solid $primary;
    border-radius: 2em;
    display: inline-block;
    color: $primary;
    font-size: 0.8em;
    padding: 4px;
    text-align: center;
  }

  .Testbook-features {
    position: fixed;
    padding: 10px;
    width: 30%;
    overflow-y: scroll;
    top: 55px;
    left: 10em;
    bottom: 0;
  }

  .TestbookFeatures--emptyState {
    margin-top: 50%;
  }

  .TestbookFeature {
    padding-top: 2px;
  }


  .TestbookFeature {
    > ul {
      list-style-type: none;
      margin: 0;
    }
  }

  .TestbookFeature--passed {
    border-top: 3px solid $green;
  }

  .TestbookFeature--failed {
    border-top: 3px solid $red;
  }

  .TestbookFeatureInfo {
    font-size: 0.8em;
    text-align: right;
  }

  .TestbookFeatureInfo-lastRun {
    color: $grey_light;
  }

  .TestbookTest {
    cursor: pointer;
    margin-top: .5em;
    clear: both;
  }

  .TestbookTest-icon {
    float: left;
    .fa {
      font-size: inherit;
    }
  }

  .TestbookTest-title {
    margin: 0;
    margin-left: 2em;
  }

  .Testbook-steps {
    list-style-type: none;
    margin-right: 0;
  }

  .Testbook-step_cmdbar {
    font-size: 0.8em;
    color: $grey_light;
    padding-bottom: 20px;
  }

  .Testbook-screenshot {
    width: 320px;
    height: 200px;
    border: 1px solid #ccc;
  }

  .TestbookDeviceSelection {
    margin-top: 15px;
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
      border-right: 2px solid $info;
    }
  }

  .Step:hover {
    cursor: pointer;
    border-right: 1px solid $info;
  }

  .Step-preview {
    float: right;
    padding: 2px;

    width: 60%
  }

  .Step-screenshot {
    margin-left: 1em;
  }

  .Step--failed {
    border-left: 4px solid $red;
    padding-left: 5px;
  }

  .Step--passed {
    border-left: 4px solid $green;
    padding-left: 5px;
  }

  .Step--inprogress {
    border-left: 4px solid $grey-lighter;
    padding-left: 5px;
  }

  .comment {
    background: #f9f9f9;
    border-left: 10px solid #ccc;
    margin: 1.5em 10px;
    padding: 0.5em 10px;
    quotes: "\201C""\201D""\2018""\2019";
  }
  .comment:before {
    color: #ccc;
    content: open-quote;
    font-size: 4em;
    line-height: 0.1em;
    margin-right: 0.25em;
    vertical-align: -0.4em;
  }
  .comment p {
    display: inline;
  }

  .u-passed {
    color: $green;
  }

  .u-failed {
    color: $red;
  }

  .u-expected {
    color: $green;
  }

  .u-actual {
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
