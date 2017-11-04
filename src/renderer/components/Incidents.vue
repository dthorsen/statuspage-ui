<template>
  <v-container grid-list-md>
    <v-layout row :align-center="true">
      <v-flex xs3><v-switch v-bind:label="`Show Resolved`" v-model="showResolved" v-bind:true-value="'incidents.json'" v-bind:false-value="'incidents/unresolved.json'" @change="getIncidentList()"></v-switch></v-flex>
      <v-flex xs9></v-flex>
    </v-layout>
    <v-layout row wrap v-if="loading">
      <v-flex xs12>Loading Incidents from statuspage.io API...
        <v-progress-circular indeterminate v-bind:width="3"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row v-if="StatusPageIncidents.length === 0">
      <v-flex xs12>
        <v-subheader>No incidents</v-subheader>
      </v-flex>
    </v-layout>
    <router-link :to="{ name: 'UpdateIncident', params: { id: Item.id }}" v-for="Item in StatusPageIncidents" :key="Item.id">
      <v-layout row>
        <v-flex xs6><v-subheader>{{ Item.name }}</v-subheader></v-flex>
        <v-flex xs6><v-subheader>{{ Item.status }}</v-subheader></v-flex>
      </v-layout>
    </router-link>
  </v-container>
</template>

<script>
  export default {
    name: 'Incidents',
    props: ['token', 'pageID', 'baseAPIURL'],
    created () {
      this.getIncidentList()
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      getIncidentList () {
        this.StatusPageIncidents = []
        this.loading = true
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          this.loading = false
          for (var Item in e.target.response) {
            this.StatusPageIncidents.push(e.target.response[Item])
          }
        }
        oReq.open('GET', this.baseAPIURL + this.pageID + '/' + this.showResolved, true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.send()
      }
    },
    data () {
      return {
        loading: false,
        showResolved: 'incidents/unresolved.json',
        StatusPageIncidents: []
      }
    }
  }
</script>
