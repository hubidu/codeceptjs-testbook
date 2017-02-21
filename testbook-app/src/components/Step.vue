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
        const withIcon = (iconName, fn) => {
          return function (step) {
            const iconHtml = `<i class="icon is-small fa fa-${iconName}"></i>`
            return `${iconHtml} ${step.actor} ${step.humanizedName} ${fn(step)}`
          }
        }
        const defaultArgs = (step) => `<span class="Step--argDefault">${step.humanizedArgs}</span>`
        const stringArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span>`
        const locatorArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span>`
        const keyArg = (step) => `<span class="Step--argKey">${step.args[0]}</span>`
        const noArg = (step) => ``
        const stringLocatorArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[1]}</span>`
        const stringStringArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argString">"${step.args[1]}"</span>`
        const locatorStringArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argString">"${step.args[1]}"</span>`
        const locatorIntegerArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argString">${step.args[1]}</span>`
        const locatorOptionalArg = (step) => `<span class="Step--argLocator">${step.args[0]}</span> <span class="Step--argOptional">${step.args[1]}s`
        const stringOptionalArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argOptional">${step.args[1]}s</span>`
        const stringLocatorOptionalArg = (step) => `<span class="Step--argString">"${step.args[0]}"</span> <span class="Step--argLocator">${step.args[2]}</span> <span class="Step--argOptional">${step.args[1]}s</span>`

        const mapping = {
          'waitForText': {
            1: withIcon('hourglass-o', stringArg),
            2: withIcon('hourglass-o', stringOptionalArg),
            3: withIcon('hourglass-o', stringLocatorOptionalArg)
          },
          'wait': {
            1: withIcon('hourglass-o', stringArg)
          },
          'waitForElement': {
            1: withIcon('hourglass-o', locatorArg),
            2: withIcon('hourglass-o', locatorOptionalArg)
          },
          'waitForVisible': {
            1: withIcon('hourglass-o', locatorArg),
            2: withIcon('hourglass-o', locatorOptionalArg)
          },
          'waitForInvisible': {
            1: withIcon('hourglass-o', locatorArg),
            2: withIcon('hourglass-o', locatorOptionalArg)
          },
          'waitForEnabled': {
            1: withIcon('hourglass-o', locatorArg),
            2: withIcon('hourglass-o', locatorOptionalArg)
          },
          'seeElement': {
            1: withIcon('eye', locatorArg)
          },
          'seeInCurrentUrl': {
            1: withIcon('eye', stringArg)
          },
          'seeInField': {
            2: withIcon('eye', locatorStringArg)
          },
          'seeNumberOfElements': {
            2: withIcon('eye', locatorIntegerArg)
          },
          'dontSee': {
            1: withIcon('eye-slash', stringArg)
          },
          'dontSeeElement': {
            1: withIcon('eye-slash', locatorArg)
          },
          'click': {
            1: withIcon('mouse-pointer', stringArg),
            2: withIcon('mouse-pointer', stringLocatorArg)
          },
          'see': {
            1: withIcon('eye', stringArg),
            2: withIcon('eye', stringLocatorArg)
          },
          'fillField': {
            2: withIcon('pencil', locatorStringArg)
          },
          'selectOption': {
            2: withIcon('question', locatorStringArg)
          },
          'pressKey': {
            1: withIcon('keyboard-o', keyArg)
          },
          'amOnPage': {
            1: withIcon('file-o', stringArg)
          },
          'saveScreenshot': {
            1: withIcon('floppy-o', stringArg)
          },
          'switchTo': {
            1: withIcon('code-fork', stringArg)
          },
          'resizeWindow': {
            1: withIcon('expand', stringArg),
            2: withIcon('expand', stringStringArg)
          },
          'clearCookie': {
            0: withIcon('eraser', noArg)
          },
          'grabAttributeFrom': {
            2: withIcon('hand-rock-o', locatorStringArg)
          },
          'grabValueFrom': {
            1: withIcon('hand-rock-o', locatorArg)
          },
          'scrollTo': {
            1: withIcon('arrows-v', locatorArg)
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
  .icon {
    color: $grey-light;
  }

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
