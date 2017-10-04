<template>
    <div id="asdf" class="container">
    <ul id="slide-out" class="side-nav fixed">
      <li><a class="waves-effect" href="#/">Components</a></li>
      <li><a class="waves-effect" href="#/Incidents">Incidents</a></li>
      <li><a class="waves-effect" href="#/NewIncident">New Incident</a></li>
    </ul>
    </div>
</template>

<script>
  export default {
    name: 'SideBarNav',
    created () {
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    },
    data () {
      return {
      }
    }
  }
</script>
