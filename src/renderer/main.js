import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import 'materialize-css/dist/css/materialize.css'
import 'materialize-css/dist/js/materialize.min.js'

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

window.$ = window.jQuery = require('jquery')

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
