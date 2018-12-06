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
    <v-layout row wrap v-if="loading">
      <v-flex xs12>Loading Incident from statuspage.io API...
        <v-progress-circular indeterminate v-bind:width="3"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-form model="formValid" ref="updateIncForm" lazy-validation>
      <v-layout row :align-center="true">
        <v-flex xs2><v-subheader>Incident Name</v-subheader></v-flex>
        <v-flex xs10><v-text-field name="incidentName" label="Incident Name" v-model="incidentName" readonly></v-text-field></v-flex>
      </v-layout>
      <v-layout row :align-center="true">
        <v-flex xs2><v-subheader>Message</v-subheader></v-flex>
        <v-flex xs10><v-textarea name="message" label="Message" v-model="message" :rules="requiredField" required></v-textarea></v-flex>
      </v-layout>
      <v-layout row :align-center="true">
        <v-flex xs2><v-subheader>Status</v-subheader></v-flex>
        <v-flex xs4><v-select label="Status" v-model="status" :items="statuses" :rules="requiredField" required></v-select></v-flex>
        <v-flex xs2><v-subheader>Impact Override</v-subheader></v-flex>
        <v-flex xs4><v-select label="Impact Override" v-model="impactOverride" :items="impactOverrideOptions" :rules="requiredField" required></v-select></v-flex>
      </v-layout>
      <v-layout row :align-center="true">
        <v-flex xs2><v-btn @click="updateIncident()" :loading="updateLoading">Update Incident</v-btn></v-flex>
      </v-layout>
    </v-form>
  </v-container>
</template>

<script>
  export default {
    name: 'UpdateIncident',
    props: ['token', 'pageID', 'baseAPIURL'],
    created () {
      this.getIncident()
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      updateIncident (e) {
        if (this.$refs.updateIncForm.validate()) {
          console.log('form submitted: ')
          this.updateLoading = true
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

          var callback = (response) => {
            var str = ''
            response.on('data', function (chunk) {
              str += chunk
            })
            response.on('end', () => {
              this.updateLoading = false
              console.log(str)
              if (response.statusCode === 200) {
                this.context = 'success'
                this.snackText = 'Successfully updated incident:' + response.statusCode + ' ' + response.statusMessage
                this.snackbar = true
              } else {
                this.context = 'error'
                this.snackText = 'Error updating incident: ' + response.statusCode + ' ' + response.statusMessage + ' - '
                var errorData = JSON.parse(str)
                this.snackText += errorData.error
                this.snackbar = true
              }
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
        }
      },
      getIncident () {
        this.loading = true
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
          this.status = this.incidentData.status
          this.loading = false
        }
        console.log(this.$route.params.id)
        oReq.open('GET', this.baseAPIURL + this.pageID + '/incidents.json', true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.send()
      },
      getStatusPageComponents () {
        // this.loading = true
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          this.StatusPageComponents = []
          for (var Item in e.target.response) {
            this.StatusPageComponents.push({
              'label': e.target.response[Item].name,
              'value': e.target.response[Item].id
            })
          }
          // this.loading = false
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
        impactOverrideOptions: [
          'none',
          'minor',
          'major',
          'critical'
        ],
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
        snackbar: false,
        snackText: '',
        context: '',
        updateLoading: false,
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
