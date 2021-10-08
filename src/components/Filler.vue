<template>
    <div id="filler-content">
        <Background class="background"/>
        <Sidebar class="sidebar"/>
        <Nextup class="nextup"/>
        <router-view class="messages"></router-view>
        <Sponsors/>
    </div>
</template>
<script>
import Background from "./Background.vue";
import Sidebar from "./Sidebar.vue";
import Nextup from "./Nextup.vue";
import Sponsors from "./Sponsors.vue";
import Messages from "./Messages.vue";

export default {
    components: {
        Background,
        Sidebar,
        Nextup,
        Sponsors
    }
}
</script>
<style scoped>
.background {
  position: absolute;
  height: 100% !important;
  width: 100%;
}
.nextup {
  position: absolute;
  top: 0;
  width: 100%;
  color: white;
}
.messages {
  position: absolute;
  top: 200px;
  left: 1250px;
  width: 650px;
  height: 750px;
}
</style>