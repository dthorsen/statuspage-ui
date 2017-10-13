<template>
  <div id="app">
    <v-app :dark="dark">
      <v-navigation-drawer
        clipped
        persistent
        enable-resize-watcher
        app
        v-model="drawer"
      >
        <v-list>
          <v-list-tile
            router
            :to="item.to"
            :key="i"
            v-for="(item, i) in items"
            exact
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar fixed>
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="dark=!dark">
          <v-icon>invert_colors</v-icon>
        </v-btn>
      </v-toolbar>
      <main>
        <v-container fluid>
            <v-slide-y-transition mode="out-in">
              <router-view></router-view>
            </v-slide-y-transition>
        </v-container>
      </main>
      <v-footer fixed>
        <v-spacer></v-spacer>
        <span>&copy; 2017</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'statuspage-ui',
    data: () => ({
      dark: true,
      drawer: true,
      fixed: false,
      items: [
        { icon: 'apps', title: 'Components', to: '/' },
        { icon: 'apps', title: 'Incidents', to: '/incidents/' },
        { icon: 'apps', title: 'New Incident', to: '/newincident/' }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Statuspage-UI'
    })
  }
</script>

<style lang="stylus">
  @import './assets/stylus/main.styl'
</style>


<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
</style>
