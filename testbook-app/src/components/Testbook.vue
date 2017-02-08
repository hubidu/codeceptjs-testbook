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


    <!--
    <div>
      <span class="TestbookTag" v-for="(suites, tag) in stats.tags">
          {{tag}}
          &nbsp;
          {{suites.length}}
      </span>
    </div>
    -->

    <div class="Testbook-features">

            <blockquote class="TestbookFeatures--emptyState has-text-centered" v-if="suites[selectedDevice].length === 0">
              No test results are yet available.
              <a href="#" v-on:click="startTestrun()">Start a test run now!</a>
            </blockquote>

            <aside>
              <div class="Testbook-feature box content" v-for="suite in suites[selectedDevice]">
                <span class="TestbookSuite-lastRun">{{ suite.t | date }}</span>
                <button class="button is-primary is-small is-outlined pull-right" v-on:click="runSuite(suite)">Run</button>
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
                      </span>
                      <h6 class="TestbookTest-title" v-html="formatMarkdown(test.title)">
                      </h6>

                    </div>

                      <ul class="Testbook-steps" v-if="isSelectedTest(test)">
                        <li>
                          <div class="Testbook-step_cmdbar">
                            {{ selectedTest.file }}

                            <button class="button is-primary is-outlined is-small pull-right" v-on:click="runSingleTest(test)">
                              Run
                            </button>
                          </div>
                        </li>

                        <li v-if="selectedTest.err">
                          <div class="notification is-danger">
                            {{ selectedTest.errorMessage }}
                          </div>

                          <div v-if="selectedTest.err.message">

                            <div class="u-expected" v-if="selectedTest.err.expected">

                                <strong class="u-expected">Expected</strong>
                                {{ selectedTest.err.expected }}

                            </div>
                            <div class="u-actual" v-if="selectedTest.err.actual">

                                <strong class="u-actual">Actual</strong>
                                {{ selectedTest.err.actual }}

                            </div>

                          </div>



                        </li>

                        <li class="Step"
                          v-bind:class="{ 'Step--active': isSelectedStep(step), 'Step--failed': step.state === 'failed', 'Step--inprogress': step.state === undefined, 'Step--passed': step.state === 'passed' && step.name !== 'comment' }"
                          v-for="step in selectedTest.stepsReverse"
                          v-on:click="selectStep(step)"
                        >
                          <div class="comment" v-if="step.name === 'comment'" v-html="formatMarkdown(step.humanizedArgs) ">

                          </div>

                          <div v-else>
                            <!--
                            <span class="u-rel-time">
                              {{relativeTime(selectedTest, step)}}
                            </span>
                            -->
                            <strong>
                              {{step.actor}} {{step.humanizedName}}
                            </strong>
                            <em>
                              {{step.humanizedArgs}}
                            </em>

                            <blockquote v-if="isSelectedStep(step)">
                              <div>
                                in
                                <em>
                                  {{step.method}}
                                </em>
                                at line
                                <em>
                                  {{step.lineNo}}
                                </em>
                                of
                                <strong>
                                  {{step.fileName}}
                                </strong>
                              </div>
                            </blockquote>
                          </div>
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
          <li v-bind:class="{ 'is-active': selectedDevice === 'desktop' }">
            <a v-on:click="selectDevice('desktop')">
              <span class="icon is-small"><i class="fa fa-desktop"></i></span>
              <span>Desktop</span>
            </a>
          </li>
          <li v-bind:class="{ 'is-active': selectedDevice === 'mobile' }">
            <a v-on:click="selectDevice('mobile')">
              <span class="icon is-small"><i class="fa fa-mobile"></i></span>
              <span>Mobile</span>
            </a>
          </li>
        </ul>
      </div>
      </section>


      <div v-if="selectedStep">
        <h2 class="title">{{selectedStep.pageTitle}}</h2>
        <div>
          <a target="_blank" v-bind:href="htmlSourceUrl(selectedStep)">HTMLSource</a>
        </div>

        <a target="_blank" v-bind:href="selectedStep.pageUrl">{{selectedStep.pageUrl}}</a>


        <hr>
        <img class="Step-screenshot" v-bind:src="screenshotUrl(selectedStep.screenshot)" alt="step screenshot">

        <pre>
          <code>
            {{selectedStep.pageSource}}
          </code>
        </pre>
      </div>
    </div>




  </div>
</template>

<script>
import marked from 'marked'
import suiteService from './suite-service'

import Navigation from './Navigation.vue'

export default {
  name: 'testbook',
  components: {
    Navigation
  },
  sockets: {
    connect: function () {
      console.log('socket connected')
    },
    'codecept.start_run': function (evt) {
      evt.type = 'codecept.start_run'
      // this.suiteName = evt.name
      suiteService.startTestRun(evt)
    },
    /*
    'codecept.start': function (evt) {
      evt.type = 'codecept.start'
      this.suiteName = evt.name
      suiteService.startTestRun(evt)
    },
    */
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
      selectedDevice: 'desktop',
      selectedStep: undefined,
      selectedTest: undefined,
      suiteName: undefined,

      state: suiteService.state(),
      suites: suiteService.suites(),
      stats: suiteService.stats()
    }
  },
  methods: {
    formatMarkdown: function (markdownString) {
      return marked(markdownString)
    },

    screenshotUrl: function (screenshot) {
      return `http://localhost:3000/screenshots/${screenshot}`
    },

    htmlSourceUrl: function (step) {
      const getLocation = function (href) {
        var l = document.createElement('a')
        l.href = href
        return l
      }

      let selector
      if (step.name === 'waitForElement') {
        selector = step.args[0]
      } else if (step.name === 'click') {
        selector = step.args[0]
      } else if (step.name === 'see' && step.args.length === 2) {
        selector = step.args[1]
      } else if (step.name === 'see' && step.args.length === 1) {
        selector = step.args[0]
      } else if (step.name === 'seeElement') {
        selector = step.args[0]
      } else if (step.name === 'fillField') {
        if (step.args[0].indexOf('input') === 0) {
          selector = step.args[0]
        } else {
          selector = 'input' + step.args[0]
        }
      } else if (step.name === 'waitForText') {
        if (step.args.length === 1) {
          selector = step.args[0]
        } else if (step.args.length === 3) {
          selector = step.args[2]
        }
      }
      selector = encodeURIComponent(selector)
      const host = encodeURIComponent(getLocation(step.pageUrl).hostname)
      return `http://localhost:3000/html-source/${step.htmlSource}?selector=${selector}&host=${host}`
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
    selectDevice: function (deviceName) {
      this.selectedDevice = deviceName
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
    runContinuously: function () {
      suiteService.reset()
      this.$socket.emit('cmd.run-continuously', {})
    },
    startTestrun: function () {
      this.selectedStep = undefined
      suiteService.reset()
      this.$socket.emit('cmd.run', {})
    },
    runSuite: function (suite) {
      this.stopTestrun()
      this.$socket.emit('cmd.run', { suite: suite.title })
    },
    runSingleTest: function (test) {
      this.stopTestrun()
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
    width: 33%;
    overflow-y: scroll;
    top: 55px;
    bottom: 0;
  }

  .TestbookFeatures--emptyState {
    margin-top: 50%;
  }

  .Testbook-feature {
    margin-right: 10px;
    > ul {
      list-style-type: none;
      margin-left: 0;
    }
  }

  .TestbookSuite-lastRun {
    float: right;
    margin-left: .5em;
    color: $grey_light;
  }

  .TestbookTest {
    cursor: pointer;
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
  }

  .Testbook-step_cmdbar {
    color: $grey_light;
    padding-bottom: 20px;
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
      border-right: 2px solid $info;
    }
  }

  .Step:hover {
    cursor: pointer;
    background-color: $grey-lighter;
  }

  .Step-preview {
    float: right;
    padding: 10px;
    // margin-left: 33%;
    width: 66%
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
