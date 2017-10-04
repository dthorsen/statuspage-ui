<template>
  <div class="container" id="components_container">
    <div class="row">
      <div class="col s3">
        <SideNavBar/>
      </div>
      <div class="col s9">
        <div class ="row" v-if="loading">Loading Components from statuspage.io API...
          <div class="preloader-wrapper small active">
            <div class="spinner-layer spinner-green-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div>
              <div class="gap-patch">
                <div class="circle"></div>
              </div>
              <div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
          <div class="row" v-for="Item in StatusPageComponents" :key="Item.id">
              <div class="col s4">{{ Item.name }}</div>
              <div class="col s4">
                <MaterialSelect v-model="Item.status" :options="statuses" :label="'Status'"></MaterialSelect>
              </div>
              <div class="col s4"><a href="#" v-on:click="updateComponent(Item.id, Item.status)">Update</a></div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
  import SideNavBar from './SideNavBar.vue'
  import MaterialSelect from './MaterialSelect.vue'

  export default {
    name: 'ComponentList',
    components: { SideNavBar, MaterialSelect },
    props: ['token', 'pageID', 'baseAPIURL'],
    created () {
      this.getComponentList()
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      getComponentList () {
        this.loading = true
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          for (var Item in e.target.response) {
            this.loading = false
            this.StatusPageComponents.push(e.target.response[Item])
          }
        }
        oReq.open('GET', this.baseAPIURL + this.pageID + '/components.json', true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.send()
      },
      updateComponent (componentId, status) {
        console.log('form submitted: ')
        var http = require('https')
        var options = {
          host: 'api.statuspage.io',
          path: '/v1/pages/' + this.pageID + '/components/' + componentId + '.json',
          port: '443',
          method: 'PATCH',
          headers: {
            'Authorization': 'OAuth ' + this.token,
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }

        var callback = function (response) {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk
          })

          response.on('end', function () {
            console.log(str)
            window.alert(response.statusCode + ' ' + response.statusMessage)
          })
        }
        var req = http.request(options, callback)
        var params = 'component[status]=' + encodeURIComponent(status)
        console.log(options.method, options.path, params)
        req.write(params)
        req.end()
      }
    },
    data () {
      return {
        loading: false,
        StatusPageComponents: [],
        statuses: [
          'operational',
          'degraded_performance',
          'partial_outage',
          'major_outage']
      }
    }
  }
</script>
