<template>
  <v-container fluid>
    <v-snackbar :timeout="60000"
      :success="context === 'success'"
      :info="context === 'info'"
      :warning="context === 'warning'"
      :error="context === 'error'"
      :multi-line="true"
      v-model="snackbar"
      :top="true">
      {{ snackText }}
      <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-layout row :align-center="true">
      <v-flex xs3><v-switch v-bind:label="`Scheduled`" v-model="scheduled"></v-switch></v-flex>
      <v-flex xs9></v-flex>
    </v-layout>
    <v-form model="formValid" ref="newIncForm" lazy-validation>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Incident Name</v-subheader></v-flex>
      <v-flex xs10><v-text-field name="incidentName" label="Incident Name" v-model="incidentName" :rules="requiredField" required></v-text-field></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Message</v-subheader></v-flex>
      <v-flex xs10><v-text-field name="message" label="Message" v-model="message" multiLine :rules="requiredField" required></v-text-field></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Status</v-subheader></v-flex>
      <v-flex xs4><v-select label="Status" v-model="status" :items="statuses" :rules="requiredField" required></v-select></v-flex>
      <v-flex xs2><v-subheader>Impact Override</v-subheader></v-flex>
      <v-flex xs4><v-select label="Impact Override" v-model="impactOverride" :items="impactOverrideOptions" :rules="requiredField" required></v-select></v-flex>
    </v-layout>
    <v-layout row :align-center="true">
      <v-flex xs2><v-subheader>Affected Components</v-subheader></v-flex>
      <v-flex s10>
        <v-select v-bind:items="StatusPageComponents" v-model="affectedComponents" label="Components" item-text="label" item-value="value" autocomplete multiple chips></v-select>
      </v-flex>
    </v-layout>
    <v-layout row :align-center="true" v-if="scheduled">
      <v-flex xs2>
        <v-subheader>Scheduled Start</v-subheader>
      </v-flex>
      <v-flex xs3>
        <v-menu lazy :close-on-content-click="false" v-model="dateStartMenu" transition="scale-transition" offset-y full-width :nudge-left="40" max-width="290px">
          <v-text-field slot="activator" label="Start Date" v-model="scheduledStartDate" prepend-icon="event" readonly :rules="requiredField" required></v-text-field>
          <v-date-picker dark v-model="scheduledStartDate" no-title scrollable autosave>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs1></v-flex>
      <v-flex xs2>
          <v-text-field label="Start Time" v-model="scheduledStartTime" prepend-icon="access_time" placeholder="HH:MM" :rules="timeRules" required></v-text-field>
      </v-flex>
      <v-flex xs2> &nbsp;{{timezoneOffset}}</v-flex>
    </v-layout>
    <v-layout row :align-center="true" v-if="scheduled">
      <v-flex xs2><v-subheader>Scheduled Completion</v-subheader></v-flex>
      <v-flex xs3>
        <v-menu lazy :close-on-content-click="false" v-model="dateEndMenu" transition="scale-transition" offset-y full-width :nudge-left="40" max-width="290px">
          <v-text-field slot="activator" label="Completion Date" v-model="scheduledEndDate" prepend-icon="event" readonly :rules="requiredField" required></v-text-field>
          <v-date-picker dark v-model="scheduledEndDate" no-title scrollable autosave>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs1></v-flex>
      <v-flex xs2>
        <v-text-field label="Completion Time" v-model="scheduledEndTime" prepend-icon="access_time" placeholder="HH:MM" :rules="timeRules" required></v-text-field>
      </v-flex>
      <v-flex xs2> &nbsp;{{timezoneOffset}}</v-flex>
    </v-layout>
    <v-layout row :align-center="true" v-if="scheduled">
      <v-flex xs2>
        <v-subheader>Options</v-subheader>
      </v-flex>
      <v-flex xs3>
        <v-switch v-bind:label="`Reminder`" v-model="scheduledReminder" v-bind:true-value="'t'" v-bind:false-value="'f'"></v-switch>
      </v-flex>
      <v-flex xs3>
        <v-switch v-bind:label="`Auto Start`" v-model="scheduledAutoStart" v-bind:true-value="'t'" v-bind:false-value="'f'"></v-switch>
      </v-flex>
      <v-flex xs3>
        <v-switch v-bind:label="`Auto Complete`" v-model="scheduledAutoComplete" v-bind:true-value="'t'" v-bind:false-value="'f'"></v-switch>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs3>
        <v-btn :loading="loading" @click="createIncident()" :disabled="loading">Create Incident</v-btn>
      </v-flex>
    </v-layout>
  </v-form>
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
        if (this.$refs.newIncForm.validate()) {
          this.loading = true
          var oReq = new XMLHttpRequest()
          oReq.onload = (e) => {
            this.loading = false
            if (e.target.status === 201) {
              this.context = 'success'
              this.snackText = 'Successfully created incident'
              this.snackbar = true
            } else {
              console.log(oReq)
              console.log(oReq.response)
              this.context = 'error'
              this.snackText = 'Error creating incident: '
              this.snackText += 'HTTP Status Code: ' + e.target.status
              this.snackText += ' ' + e.target.statusText + ' - '
              this.snackText += oReq.response.error
              this.snackbar = true
            }
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
            var sd = this.scheduledStartDate.split('-')
            var st = this.scheduledStartTime.split(':')
            var ed = this.scheduledEndDate.split('-')
            var et = this.scheduledEndTime.split(':')

            var startDate = new Date(sd[0], sd[1] - 1, sd[2], st[0], st[1])
            var endDate = new Date(ed[0], ed[1] - 1, ed[2], et[0], et[1])

            params += '&incident[scheduled_for]=' + encodeURIComponent(startDate.toISOString())
            params += '&incident[scheduled_until]=' + encodeURIComponent(endDate.toISOString())
            params += '&incident[scheduled_remind_prior]=' + encodeURIComponent(this.scheduledReminder)
            params += '&incident[scheduled_auto_in_progress]=' + encodeURIComponent(this.scheduledAutoStart)
            params += '&incident[scheduled_auto_completed]=' + encodeURIComponent(this.scheduledAutoComplete)
          }
          oReq.send(params)
        }
      },
      getStatusPageComponents () {
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
        incidentName: '',
        loader: null,
        formValid: true,
        message: '',
        status: '',
        timezoneOffset: Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)[1],
        scheduled: false,
        scheduledStartDate: null,
        scheduledStartTime: '',
        scheduledEndDate: null,
        scheduledEndTime: '',
        scheduledStart: '',
        scheduledEnd: '',
        scheduledReminder: 'f',
        scheduledAutoStart: 'f',
        scheduledAutoComplete: 'f',
        dateStartMenu: false,
        timeStartMenu: false,
        dateEndMenu: false,
        timeEndMenu: false,
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
        snackbar: false,
        snackText: '',
        context: '',
        timeRules: [
          (v) => !!v || 'Time is required',
          (v) => /^[0-2][0-9]:[0-5][0-9]$/.test(v) || 'Time must be in HH:MM 24h format'
        ],
        requiredField: [
          (v) => !!v || 'Field is required'
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
