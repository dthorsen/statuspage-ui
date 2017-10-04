<template>
  <div class="container">
    <div class="row">
      <div class="col s3">
        <SideNavBar/>
      </div>
      <div class="col s9">
        <div class="row">
          <form action="#" onsubmit="javascript:createIncident()" method="POST" class="col s12">
            <div class="row">
              <div class="input-field col s12">
                <input id="incident_name" v-model="incidentName" type="text" class="validate">
                <label class="active" for="incident_name">Incident Name</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <input id="message" v-model="message" type="text" class="validate">
                <label for="message">Message</label>
              </div>
            </div>
            <div class="row">
              <div class="col s12">
                <v-select v-model="status" :options="statuses" placeholder="Status"></v-select>
                <label>Status</label>
              </div>
            </div>
            <div class="row">
              <div class="col s12">
                <v-select v-model="impactOverride" :options="['none','minor','major','critical']" placeholder="Impact Override"></v-select>
                <label>Impact Override</label>
              </div>
            </div>
            <div class="row">
              <div class="col s12">
                <div class="input-field inline">
                  <a v-on:click="updateIncident" class="waves-effect waves-light btn">Update Incident</a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import SideNavBar from './SideNavBar.vue'

  export default {
    name: 'UpdateIncident',
    components: { SideNavBar },
    props: ['token', 'pageID', 'baseAPIURL'],
    created () {
      this.getIncident()
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      updateIncident (e) {
        console.log('form submitted: ')
        console.log(this.affectedComponents)
        this.loading = true
        var http = require('https')
        var options = {
          host: 'api.statuspage.io',
          path: '/v1/pages/' + this.pageID + '/incidents/' + this.$route.params.id + '.json',
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
        var params = 'incident[message]=' + encodeURIComponent(this.message) +
          '&incident[status]=' + encodeURIComponent(this.status)
        if (this.impactOverride !== '') {
          params += '&incident[impact_override]=' + encodeURIComponent(this.impactOverride)
        }
        req.write(params)
        req.end()
      },
      getIncident () {
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          for (var Item in e.target.response) {
            if (e.target.response[Item].id === this.$route.params.id) {
              this.incidentData = e.target.response[Item]
              break
            }
          }
          this.incidentName = this.incidentData.name
          this.impactOverride = this.incidentData.impact_override
          if (this.scheduledStatuses.includes(this.incidentData.status)) {
            this.scheduled = true
          }
        }
        console.log(this.$route.params.id)
        oReq.open('GET', this.baseAPIURL + this.pageID + '/incidents.json', true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.send()
      },
      getStatusPageComponents () {
        this.loading = true
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          this.StatusPageComponents = []
          for (var Item in e.target.response) {
            this.StatusPageComponents.push({
              'label': e.target.response[Item].name,
              'value': e.target.response[Item].id
            })
          }
          this.loading = false
        }
        oReq.open('GET', this.baseAPIURL + this.pageID + '/components.json', true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.send()
      }
    },
    data () {
      return {
        loading: false,
        incidentData: {},
        StatusPageIncidents: [],
        StatusPageComponents: null,
        incidentName: '',
        message: '',
        status: '',
        scheduled: false,
        scheduledStart: '',
        scheduledEnd: '',
        scheduledReminder: 'f',
        scheduledAutoStart: 'f',
        scheduledAutoComplete: 'f',
        affectedComponents: null,
        impactOverride: '',
        realtimeStatuses: [
          'identified',
          'investigating',
          'monitoring',
          'resolved'
        ],
        scheduledStatuses: [
          'scheduled',
          'in_progress',
          'verifying',
          'completed'
        ]
      }
    },
    computed: {
      statuses: function () {
        if (this.scheduled) {
          return this.scheduledStatuses
        } else {
          return this.realtimeStatuses
        }
      }
    }
  }
</script>
