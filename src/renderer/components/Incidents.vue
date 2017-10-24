<template>
  <v-container grid-list-md>
    <v-layout row wrap v-if="loading">
      <v-flex xs12>Loading Incidents from statuspage.io API...
        <v-progress-circular indeterminate v-bind:width="3"></v-progress-circular>
      </v-flex>
    </v-layout>
    <router-link :to="{ name: 'UpdateIncident', params: { id: Item.id }}" v-for="Item in StatusPageIncidents" :key="Item.id">
      <v-layout row xs12>
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
        this.loading = true
        var oReq = new XMLHttpRequest()
        oReq.onload = (e) => {
          for (var Item in e.target.response) {
            this.loading = false
            this.StatusPageIncidents.push(e.target.response[Item])
          }
        }
        oReq.open('GET', this.baseAPIURL + this.pageID + '/incidents.json', true)
        oReq.responseType = 'json'
        oReq.setRequestHeader('Authorization', 'OAuth ' + this.token)
        oReq.send()
      }
    },
    data () {
      return {
        loading: false,
        StatusPageIncidents: []
      }
    }
  }
</script>
