<template>
  <v-container fluid>
    <v-layout row :align-center="true" v-if="createSuccess">
      <v-flex green xs12>
        <v-alert icon="check_circle" dismissible v-model="createSuccess">
          Successfully created incident
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout row :align-center="true" v-if="createFailed">
      <v-flex red xs12>
        <v-alert green icon="warning" dismissible v-model="createFailed">
          Error creating incident: {{createError}}
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs3><v-switch v-bind:label="`Scheduled`" v-model="scheduled"></v-switch></v-flex>
      <v-flex xs9></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Incident Name</v-subheader></v-flex>
      <v-flex xs10><v-text-field name="incidentName" label="Incident Name" v-model="incidentName"></v-text-field></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Message</v-subheader></v-flex>
      <v-flex xs10><v-text-field name="message" label="Message" v-model="message"></v-text-field></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Status</v-subheader></v-flex>
      <v-flex xs4><v-select label="Status" v-model="status" :items="statuses"></v-select></v-flex>
      <v-flex xs2><v-subheader>Impact Override</v-subheader></v-flex>
      <v-flex xs4><v-select label="Impact Override" v-model="impactOverride" :items="impactOverrideOptions"></v-select></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Affected Components</v-subheader></v-flex>
      <v-flex s10>
        <v-select v-bind:items="StatusPageComponents" v-model="affectedComponents" label="Components" item-text="label" item-value="value" autocomplete multiple chips></v-select>
      </v-flex>
    </v-layout>
    <v-layout row :align-center="true" v-if="scheduled">
      <v-flex xs3>
        <v-menu lazy :close-on-content-click="false" v-model="dateStartMenu" transition="scale-transition" offset-y full-width :nudge-left="40" max-width="290px">
          <v-text-field slot="activator" label="Start Date" v-model="scheduledStartDate" prepend-icon="event" readonly></v-text-field>
          <v-date-picker v-model="scheduledStartDate" no-title scrollable autosave>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs3>
        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="timeStartMenu"
          transition="scale-transition"
          offset-y
          :nudge-left="40"
        >
          <v-text-field
            slot="activator"
            label="Start Time"
            v-model="scheduledStartTime"
            prepend-icon="access_time"
            readonly
          ></v-text-field>
          <v-time-picker v-model="scheduledStartTime" autosave></v-time-picker>
        </v-menu>
      </v-flex>
      <!--
      <v-flex xs3><v-date-picker></v-date-picker></v-flex>
      <v-flex xs3><v-time-picker></v-time-picker></v-flex>
    -->
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'NewIncident',
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
        StatusPageComponents: [],
        incidentName: 'Asdf',
        message: '',
        status: '',
        scheduled: false,
        scheduledStartDate: null,
        scheduledStartTime: null,
        scheduledStart: '',
        scheduledEnd: '',
        scheduledReminder: 'f',
        scheduledAutoStart: 'f',
        scheduledAutoComplete: 'f',
        dateStartMenu: false,
        timeStartMenu: false,
        affectedComponents: [],
        impactOverride: 'none',
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
        ],
        impactOverrideOptions: [
          'none',
          'minor',
          'major',
          'critical'
        ],
        createSuccess: false,
        createFailed: false,
        createError: ''
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
