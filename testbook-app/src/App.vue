<template>
  <div id="app">
    <testbook></testbook>
  </div>
</template>

<script>
import Testbook from './components/Testbook'

export default {
  name: 'app',
  components: {
    Testbook
  }
}
</script>


<style lang="scss">
@import '~bulma';
@import '~bulma/sass/utilities/variables';
@import '~bulma/sass/utilities/mixins';

#app {
}

</style>
