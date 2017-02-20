<template>
  <div class="TestbookTags" v-if="tags">
    <ul>
      <li v-for="(suites, tag) in tags">
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
  .TestbookTags {
    position: fixed;
    font-size: 0.8em;
    padding: 10px;
    width: 12em;
    top: 55px;
    left: 0;
    bottom: 0;
  }

</style>
