<template>
  <nav class="Testbook-navigation nav has-shadow">
      <div class="nav-left">
        <h1 class="nav-item title">
          <span class="logo">
          <svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48">
              <path fill="#673AB7" d="M38,44H12V4h26c2.2,0,4,1.8,4,4v32C42,42.2,40.2,44,38,44z"/>
              <path fill="#311B92" d="M10,4h2v40h-2c-2.2,0-4-1.8-4-4V8C6,5.8,7.8,4,10,4z"/>
              <path fill="#fff" d="M36,24.2c-0.1,4.8-3.1,6.9-5.3,6.7c-0.6-0.1-2.1-0.1-2.9-1.6c-0.8,1-1.8,1.6-3.1,1.6c-2.6,0-3.3-2.5-3.4-3.1 c-0.1-0.7-0.2-1.4-0.1-2.2c0.1-1,1.1-6.5,5.7-6.5c2.2,0,3.5,1.1,3.7,1.3L30,27.2c0,0.3-0.2,1.6,1.1,1.6c2.1,0,2.4-3.9,2.4-4.6 c0.1-1.2,0.3-8.2-7-8.2c-6.9,0-7.9,7.4-8,9.2c-0.5,8.5,6,8.5,7.2,8.5c1.7,0,3.7-0.7,3.9-0.8l0.4,2c-0.3,0.2-2,1.1-4.4,1.1 c-2.2,0-10.1-0.4-9.8-10.8C16.1,23.1,17.4,14,26.6,14C35.8,14,36,22.1,36,24.2z M24.1,25.5c-0.1,1,0,1.8,0.2,2.3 c0.2,0.5,0.6,0.8,1.2,0.8c0.1,0,0.3,0,0.4-0.1c0.2-0.1,0.3-0.1,0.5-0.3c0.2-0.1,0.3-0.3,0.5-0.6c0.2-0.2,0.3-0.6,0.4-1l0.5-5.4 c-0.2-0.1-0.5-0.1-0.7-0.1c-0.5,0-0.9,0.1-1.2,0.3c-0.3,0.2-0.6,0.5-0.9,0.8c-0.2,0.4-0.4,0.8-0.6,1.3S24.2,24.8,24.1,25.5z"/>
          </svg>
          </span>
          &nbsp;
          <strong>
            &lt;testbook/&gt;
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
        <!--
        <a class="nav-item">
          <button class="button is-secondary" type="button" v-on:click="runContinuosly()">Continuous Mode</button>
        </a>
        -->
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
      return {}
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

  .logo {
    width: 32px;
  }

 .u-passed {
    color: $green;
  }

  .u-failed {
    color: $red;
  }
</style>
