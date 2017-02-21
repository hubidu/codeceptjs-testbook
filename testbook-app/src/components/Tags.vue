<template>
  <div class="TestbookTags" v-if="tags">
    <ul class="TestbookTags-container">
      <li class="TestbookTags-tag" v-for="(suites, tag) in tags">
        ({{suites.length}}) {{ tag }}
      </li>
    </ul>
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

  .TestbookTags {
    position: fixed;
    padding: 10px;
    width: 12em;
    top: 55px;
    left: 0;
    bottom: 0;
  }

  .TestbookTags-container {
    margin: .5em;
    font-size: 0.8em;
    font-style: normal;
  }

  .TestbookTags-tag {
    margin-right: 3px;
    padding: 1px 2px;
    color: $info;
    border: 1px solid $info;
    border-radius: 2px;
  }

</style>
