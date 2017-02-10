// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'

import 'font-awesome/css/font-awesome.min.css'

// TODO: Make url configurable
if (process.env.NODE_ENV === 'production') {
  Vue.use(VueSocketio, '/')
} else {
  Vue.use(VueSocketio, 'http://localhost:3333')
}

const toTime = function (ts) {
  const d = new Date(ts)

  let hours = d.getHours()
  let minutes = d.getMinutes()

  if (hours < 10) { hours = '0' + hours }
  if (minutes < 10) { minutes = '0' + minutes }
  return hours + ':' + minutes
}

Vue.filter('toTime', toTime)

import App from './App'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
