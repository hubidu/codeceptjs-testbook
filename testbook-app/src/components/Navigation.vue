<template>
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
        <a class="nav-item">
          <button class="button is-secondary" type="button" v-on:click="runContinuosly()">Continuous Mode</button>
        </a>
        <a class="nav-item" v-if="state.state === undefined">
          <button class="button is-primary" type="button" v-on:click="runAllTests()">Run All</button>
        </a>
        <a class="nav-item">
          <button class="button is-secondary" type="button" v-on:click="stopTestRun()">
            Stop
          </button>
        </a>
      </div>
    </nav>
</template>
<script>
  export default {
    name: 'Navigation',
    props: ['stats', 'state'],
    data () {
      return {

      }
    },

    methods: {
      runContinuosly () {
        this.$emit('testrun-continuously')
      },
      runAllTests () {
        this.$emit('testrun-start')
      },
      stopTestRun () {
        this.$emit('testrun-stop')
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import '~bulma/sass/utilities/variables';

 .u-passed {
    color: $green;
  }

  .u-failed {
    color: $red;
  }
</style>
