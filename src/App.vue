<template>
  <v-app id="app">
    <v-main id="main">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.$store.dispatch("loadXML")
    setInterval(() => { this.$store.commit("updateTime"); this.$store.dispatch("checkSchedule") }, 1000/60);
    let store = this.$store;
    this.$store.watch(store=>store.current_timeslot, (nevt) => {
      if (nevt && !nevt.live && store.state.on_site) {
        this.$router.push({ path: `/player/${nevt.event_id}`});
      }
      if (nevt && nevt.live && store.state.on_site) {
        this.$router.push({ path: `/filler/remaining` })
      } else if (!nevt) {
        this.$router.push({ path: `/filler` })
      }
    });
  }
};
</script>
<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap');

.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
#app {
  height:100vh;
}
#main {
  position: absolute;
  height: 1080px;
  width: 1920px
}
</style>