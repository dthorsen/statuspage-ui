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
              <div class="switch col s12">
                Scheduled Maintenance:
                <label>
                  Off
                  <input type="checkbox" v-model="scheduled" v-bind:true-value="true" v-bind:false-value="false">
                  <span class="lever"></span>
                  On
                </label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <input id="incident_name" v-model="incidentName" type="text" class="validate">
                <label for="incident_name">Incident Name</label>
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
                <v-select multiple v-model="affectedComponents" :options="StatusPageComponents" :debounce="1000" placeholder="Search components"></v-select>
                <label>Affected Components</label>
              </div>
            </div>
            <div class="row" v-if="scheduled">
              <div class="input-field col s6">
                <input id="scheduled_start_date" v-model="scheduledStart" type="text" class="validate">
                <label for="incident_name">Scheduled Start</label>
              </div>
              <div class="input-field col s6">
                <input id="scheduled_start_time" v-model="scheduledEnd" type="text" class="validate">
                <label for="incident_name">Scheduled End</label>
              </div>
            </div>
            <div class="row" v-if="scheduled">
              <div class="switch col s12">
                Scheduled Reminder Prior:
                <label>
                  Off
                  <input type="checkbox" v-model="scheduledReminder" v-bind:true-value="'t'" v-bind:false-value="'f'">
                  <span class="lever"></span>
                  On
                </label>
              </div>
            </div>
            <div class="row" v-if="scheduled">
              <div class="switch col s12">
                Scheduled Automatic Start:
                <label>
                  Off
                  <input type="checkbox" v-model="scheduledAutoStart" v-bind:true-value="'t'" v-bind:false-value="'f'">
                  <span class="lever"></span>
                  On
                </label>
              </div>
            </div>
            <div class="row" v-if="scheduled">
              <div class="switch col s12">
                Scheduled Automatic Complete:
                <label>
                  Off
                  <input type="checkbox" v-model="scheduledAutoComplete" v-bind:true-value="'t'" v-bind:false-value="'f'">
                  <span class="lever"></span>
                  On
                </label>
              </div>
            </div>
            <div class="row">
              <div class="col s12">
                <div class="input-field inline">
                  <a v-on:click="createIncident" class="waves-effect waves-light btn">Create Incident</a>
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
    name: 'NewIncident',
    components: { SideNavBar },
    props: ['token', 'pageID', 'baseAPIURL'],
    created () {
      this.getStatusPageComponents()
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      createIncident (e) {
        console.log('form submitted: ')
        console.log(this.affectedComponents)
        this.loading = true
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          this.loading = false
          console.log(e.target.response)
        }
        oReq.open('POST', this.baseAPIURL + this.pageID + '/incidents.json', true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        var params = 'incident[name]=' + encodeURIComponent(this.incidentName) +
          '&incident[message]=' + encodeURIComponent(this.message) +
          '&incident[status]=' + encodeURIComponent(this.status) +
          '&incident[impact_override]=' + encodeURIComponent(this.impactOverride)
        for (var affectedComponent in this.affectedComponents) {
          params += '&incident[component_ids][]=' + encodeURIComponent(this.affectedComponents[affectedComponent].value)
        }
        if (this.scheduled) {
          params += '&incident[scheduled_for]=' + encodeURIComponent(this.scheduledStart)
          params += '&incident[scheduled_until]=' + encodeURIComponent(this.scheduledEnd)
          params += '&incident[scheduled_remind_prior]=' + encodeURIComponent(this.scheduledReminder)
          params += '&incident[scheduled_auto_in_progress]=' + encodeURIComponent(this.scheduledAutoStart)
          params += '&incident[scheduled_auto_completed]=' + encodeURIComponent(this.scheduledAutoComplete)
        }
        oReq.send(params)
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
