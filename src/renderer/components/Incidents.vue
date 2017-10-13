<template>
  <div class="container" id="incidents_container">
    <div class="row">
      <div class="col s9">
        <div v-if="loading">Loading Incidents from statuspage.io API...
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
        <div class="collection">
          <router-link :to="{ name: 'UpdateIncident', params: { id: Item.id }}" v-for="Item in StatusPageIncidents">
            <div class="container">
              <div class="row">
                <div class="col s6">{{ Item.name }}</div>
                <div class="col s6">{{ Item.status }}</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
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
