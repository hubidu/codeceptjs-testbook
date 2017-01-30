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
              {{stats.env.environment}}
          </a>
          <a class="nav-item">
              {{stats.env.device}}
          </a>
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


    <section class="section">
      <span class="tag is-info" v-for="(suites, tag) in stats.tags">
          {{tag}}
          &nbsp;
          {{suites.length}}
      </span>
    </section>

    <section class="section Testbook-features">

            <blockquote class="has-text-centered" v-if="suites.length === 0">
              <strong>
                No test results are yet available.
                <a href="#" v-on:click="runAllTests()">Start a test run now!</a>
              </strong>
            </blockquote>

            <aside>
              <div class="Testbook-feature box content" v-for="suite in suites">
                <h4 class="title" v-html="formatMarkdown(suite.title)">
                </h4>
                <ul v-for="test in suite.tests">
                  <li>
                    <div class="Testbook-test" v-bind:class="{ 'is-active': isSelectedTest(test) }" v-on:click="selectTest(test)">
                      <h5 class="subtitle">
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
                      </h5>

                    </div>

                      <ul class="Testbook-steps" v-if="isSelectedTest(test)">
                        <li>
                          <div class="Testbook-step_cmdbar">
                            {{ selectedTest.file }}

                            <button class="button is-primary is-outlined is-small pull-right" v-on:click="runTest(test)">
                              Run
                            </button>
                          </div>
                        </li>

                        <li v-if="selectedTest.err">
                          <div class="notification is-danger">
                            {{ selectedTest.errorMessage }}
                          </div>
                          
                          <div v-if="selectedTest.err.message"> 

                            <div class="message is-success" v-if="selectedTest.err.message.expected">
                              <div class="message-body">
                                <strong>Expected</strong>
                                {{ selectedTest.err.message.expected }}
                              </div>
                            </div>
                            <div class="message is-danger" v-if="selectedTest.err.message.actual">
                              <div class="message-body">
                                <strong>Actual</strong>
                                {{ selectedTest.err.message.actual }}
                              </div>
                            </div>

                          </div>


                          
                        </li>

                        <li class="Step" v-bind:class="{ 'Step--active': isSelectedStep(step) }"
                          v-for="step in selectedTest.stepsReverse"
                          v-on:click="selectStep(step)">
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
                        </li>

                      </ul>

                  </li>
                </ul>
              </div>
            </aside>

    </section>

    <div class="Step-preview">
      <div v-if="selectedStep">
        <h2>{{selectedStep.pageTitle}}</h2>

        <a target="_blank" v-bind:href="selectedStep.pageUrl">{{selectedStep.pageUrl | truncate 50}}</a>
        
        <a target="_blank" v-bind:href="htmlSourceUrl(selectedStep)">HTMLSource</a>
        
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

export default {
  name: 'hello',
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
    formatMarkdown: function (markdownString) {
      return marked(markdownString)
    },

    screenshotUrl: function (screenshot) {
      return `http://localhost:3000/screenshots/${screenshot}`
    },

    htmlSourceUrl: function (step) {
      let selector
      if (step.name === 'waitForElement') {
        selector = step.args[0]
      } else if (step.name === 'click') {
        selector = step.args[0]
      } else if (step.name === 'see' && step.args.length === 2) {
        selector = step.args[1]
      }
      selector = encodeURIComponent(selector)
      return `http://localhost:3000/html-source/${step.htmlSource}?selector=${selector}`
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

  .Testbook-features {
    position:absolute;
    height: 100%;
    width: 33%;
    overflow-y: scroll;
  }

  .Testbook-feature {
    > ul {
      list-style-type: none;
      margin-left: 0;
    }
  }

  .Testbook-test {
    cursor: pointer;
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
      background-color: $grey;
    }
  }

  .Step:hover {
    cursor: pointer;
    background-color: $grey-lighter;
  }

  .Step-preview {
    float: right;
    padding: 10px;
    margin-left: 33%;
  }

  .Step-screenshot {
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
