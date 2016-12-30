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

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

a {
  color: #42b983;
}

</style>
