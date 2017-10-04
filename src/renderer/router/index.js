import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

var fs = require('fs')
var os = require('os')
try {
  var AppConfig = JSON.parse(fs.readFileSync(os.homedir() + '/.statuspage-ui', 'utf8'))
} catch (err) {
  console.log('Failed to open config file')
  AppConfig = false
}
export default new Router({
  routes: [
    {
      path: '/',
      name: 'ComponentList',
      component: require('@/components/ComponentList'),
      props: AppConfig
    },
    {
      path: '/incidents/',
      name: 'Incidents',
      component: require('@/components/Incidents'),
      props: AppConfig
    },
    {
      path: '/newincident/',
      name: 'NewIncident',
      component: require('@/components/NewIncident'),
      props: AppConfig
    },
    {
      path: '/updateincident/:id',
      name: 'UpdateIncident',
      component: require('@/components/UpdateIncident'),
      props: AppConfig
    }
    /* ,
    {
      path: '*',
      redirect: '/'
    } */
  ]
})
