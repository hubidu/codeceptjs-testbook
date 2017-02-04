// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'
var VueFilter = require('vue-filter')

import 'font-awesome/css/font-awesome.min.css'

// TODO: Make url configurable
Vue.use(VueSocketio, 'http://localhost:3000')
Vue.use(VueFilter)

Vue.filter('date', function (t) {
  const d = new Date(t)
  return `${d.getUTCHours()}:${d.getUTCMinutes()}`
})

import App from './App'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
