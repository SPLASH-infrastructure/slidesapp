<template>
    <div class="sidebar">
      <Upcoming class="upcoming"/>
      <div class="note-text">
          <h2>{{$store.state.room}}</h2>
          <h3>{{$store.state.now.toLocaleString({ weekday: 'long' })}}</h3>
      </div>
    </div>
</template>
<script>
import Upcoming from './Upcoming.vue';
export default {
  components: {
      Upcoming
  },
  computed: {
    getMessageTitle() {
      return this.$store.state.message_title;
    },
    getMessageSubtitle() {
      return this.$store.state.message_subtitle;
    },
  }
}
</script>
<style scoped scss>
.sidebar {
    position: absolute;
    top: 180px;
    bottom: 108px;
    width: 762px;
    background-color: rgba(200,200,200,0.9);
}
.upcoming {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 1200px;
  height: 600px;
  font-family: 'Montserrat', sans-serif;
}
.note-text {
    position: absolute;
    bottom: 30px;
    left: 90px;
    width: 670px;
    overflow: hidden;
    
    font-family: 'Montserrat', sans-serif;
    font-size: 21pt !important;
    font-weight: 800;
}
.note-text > h3 {
    color: #BE1622;
}
</style>