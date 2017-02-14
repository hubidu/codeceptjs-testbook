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
      <span v-html="formatArgs(step)"></span>

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
        const withIcon = (iconHtml, fn) => {
          return function (step) {
            return `${iconHtml} ${step.actor} ${step.humanizedName} ${fn(step)}`
          }
        }
        const defaultArgs = (step) => `<span class="Step--argDefault">${step.humanizedArgs}</span>`
        const stringArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span>`
        const locatorArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span>`
        const keyArg = (step) => `<span class="Step--argKey">${step.args[0]}</span>`
        const stringLocatorArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[1]}</span>`
        const locatorStringArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argString">"${step.args[1]}"</span>`
        const locatorOptionalArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argOptional">${step.args[1]}s`
        const stringOptionalArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argOptional">${step.args[1]}s</span>`
        const stringLocatorOptionalArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[2]}</span> <span class="Step--argOptional">${step.args[1]}s</span>`

        const mapping = {
          'waitForText': {
            1: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', stringArg),
            2: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', stringOptionalArg),
            3: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', stringLocatorOptionalArg)
          },
          'waitForElement': {
            1: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorArg),
            2: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorOptionalArg)
          },
          'waitForVisible': {
            1: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorArg),
            2: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorOptionalArg)
          },
          'waitForInvisible': {
            1: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorArg),
            2: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorOptionalArg)
          },
          'waitForEnabled': {
            1: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorArg),
            2: withIcon('<i class="icon is-small fa fa-hourglass-o"></i>', locatorOptionalArg)
          },
          'seeElement': {
            1: withIcon('<i class="icon is-small fa fa-eye"></i>', locatorArg)
          },
          'dontSeeElement': {
            1: withIcon('<i class="icon is-small fa fa-eye-slash"></i>', locatorArg)
          },
          'click': {
            1: withIcon('<i class="icon is-small fa fa-mouse-pointer"></i>', stringArg),
            2: withIcon('<i class="icon is-small fa fa-mouse-pointer"></i>', stringLocatorArg)
          },
          'see': {
            1: withIcon('<i class="icon is-small fa fa-eye"></i>', stringArg),
            2: withIcon('<i class="icon is-small fa fa-eye"></i>', stringLocatorArg)
          },
          'fillField': {
            2: withIcon('<i class="icon is-small fa fa-pencil"></i>', locatorStringArg)
          },
          'selectOption': {
            2: withIcon('<i class="icon is-small fa fa-question"></i>', locatorStringArg)
          },
          'pressKey': {
            1: withIcon('<i class="icon is-small fa fa-keyboard-o"></i>', keyArg)
          },
          'amOnPage': {
            1: withIcon('<i class="icon is-small fa fa-file-o"></i>', stringArg)
          },
          'saveScreenshot': {
            1: withIcon('<i class="icon is-small fa fa-floppy-o"></i>', stringArg)
          }
        }

        if (mapping[step.name]) {
          const formatFn = mapping[step.name][step.args.length] || defaultArgs
          return formatFn(step)
        } else {
          return withIcon('', defaultArgs)(step)
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
