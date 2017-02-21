<template>
  <div class="TestbookSuiteTags">
    <span class="TestbookSuiteTag" v-for="tag in tags">@{{ tag }}</span>
  </div>
</template>

<script>
  export default {
    name: 'tags',
    props: ['tags'],
    data () {
      return {}
    },
    methods: {

    }
  }
</script>

<style lang="scss">
  @import '~bulma/sass/utilities/variables';

  .TestbookSuiteTags {
    margin-bottom: .5em;
    font-size: 0.8em;
    font-style: normal;
  }

  .TestbookSuiteTag {
    margin-right: 3px;
    padding: 1px 2px;
    color: $info;
    opacity: 0.8
  }
</style>
