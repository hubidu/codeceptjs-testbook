<template>
  <div class="Step">
    <div class="comment" v-if="step.name === 'comment'" v-html="formatMarkdown(step.humanizedArgs)">
    </div>

    <div v-else>
      <!--
      <span class="u-rel-time">
        {{relativeTime(selectedTest, step)}}
      </span>
      -->
      <span>
        {{step.actor}} {{step.humanizedName}}
      </span>
      &nbsp;
      <em v-html="formatArgs(step)">
      </em>

      <blockquote v-if="isSelected">
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

  </div>
</template>
<script>
  import marked from 'marked'
  export default {
    name: 'step',
    props: ['step', 'is-selected'],
    data () {
      return {}
    },
    methods: {
      formatMarkdown: function (markdownString) {
        return marked(markdownString)
      },

      formatArgs: function (step) {
        if (step.name === 'waitForElement' && step.args.length === 1) {
          return `<span class="Step--argLocator">${step.args[0]}</span>`
        } else if (step.name === 'waitForElement' && step.args.length === 2) {
          return `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argOptional">${step.args[1]}s`
        } else if (step.name === 'seeElement' && step.args.length === 1) {
          return `<span class="Step--argLocator">${step.args[0]}</span>`
        } else if (step.name === 'click' && step.args.length === 1) {
          return `<i class="icon is-small fa fa-mouse-pointer"></i><span class="Step--argString">"${step.args[0]}"</span>`
        } else if (step.name === 'click' && step.args.length === 2) {
          return `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[1]}</span>`
        } else if (step.name === 'see' && step.args.length === 2) {
          return `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[1]}</span>`
        } else if (step.name === 'fillField' && step.args.length === 2) {
          return `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argString">"${step.args[1]}"</span>`
        } else if (step.name === 'selectOption' && step.args.length === 2) {
          return `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argString">"${step.args[1]}"</span>`
        } else if (step.name === 'pressKey' && step.args.length === 1) {
          return `<i class="icon is-small fa fa-keyboard-o"></i> <span class="Step--argKey">${step.args[0]}</span>`
        } else if (step.name === 'amOnPage' && step.args.length === 1) {
          return `<span class="Step--argString">"${step.args[0]}"</span>`
        } else if (step.name === 'see' && step.args.length === 1) {
          return `<i class="icon is-small fa fa-eye-slash"></i><span class="Step--argString">"${step.args[0]}"</span>`
        } else if (step.name === 'waitForText' && step.args.length === 1) {
          return `<span class="Step--argString">"${step.args[0]}"</span>`
        } else if (step.name === 'waitForText' && step.args.length === 3) {
          return `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[2]}</span> <span class="Step--argOptional">${step.args[1]}s</span>`
        } else {
          return `<span class="Step--argDefault">${step.humanizedArgs}</span>`
        }
      }
    }
  }
</script>
<style lang="scss">
  @import '~bulma/sass/utilities/variables';

  .Step--argString {
    color: $blue;
  }

  .Step--argLocator {
    color: $purple;
  }

  .Step--argOptional {
    color: $grey-light;
  }

  .Step--argKey {
    color: $blue;
  }

</style>
