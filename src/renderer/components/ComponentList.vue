<template>
  <v-container grid-list-md>
    <v-layout row wrap v-if="updateSuccess">
      <v-flex green xs12>
        <v-alert icon="check_circle" dismissible v-model="updateSuccess">
          Updated component status
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="updateFailed">
      <v-flex red xs12>
        <v-alert green icon="warning" dismissible v-model="updateFailed">
          Error updating component: {{updateError}}
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="loading">
      <v-flex xs12>Loading Components from statuspage.io API...
        <v-progress-circular indeterminate v-bind:width="3"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row v-for="Item in StatusPageComponents" :key="Item.id">
      <v-flex xs5>{{ Item.name }}</v-flex>
      <v-flex xs3>
        <v-select label="Status" v-model="Item.status" :items="statuses"></v-select>
      </v-flex>
      <v-flex xs4>
        <v-btn @click="updateComponent(Item.id, Item.status)">Update</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'ComponentList',
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
          var componentKeys = []
          var componentMap = {}
          for (var Item in e.target.response) {
            componentMap[e.target.response[Item].name] = Item
            componentKeys.push(e.target.response[Item].name)
          }
          componentKeys.sort()
          for (Item in componentKeys) {
            this.StatusPageComponents.push(e.target.response[componentMap[componentKeys[Item]]])
          }
          this.loading = false
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

        var callback = (response) => {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk
          })

          response.on('end', () => {
            console.log(str)
            console.log('Response code: ' + response.statusCode)
            if (response.statusCode === 200) {
              this.updateSuccess = true
            } else {
              this.updateFailed = true
              this.updateError = response.statusCode + ' ' + response.statusMessage + ' '
              var errorData = JSON.parse(str)
              console.log(errorData.error)
              this.updateError += errorData.error
            }
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
        updateSuccess: false,
        updateFailed: false,
        updateError: '',
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
