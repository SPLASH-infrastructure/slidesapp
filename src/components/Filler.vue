<template>
    <div id="filler-content">
        <Background class="background"/>
        <Sidebar class="sidebar"/>
        <Nextup class="nextup"/>
        <router-view class="messages"></router-view>
        <Sponsors/>
        <v-dialog v-model="dialog" width="500" persistent>
          <v-card>
            <v-card-title class="text-h4 grey lighten-2">
              Live in Zoom
            </v-card-title>

            <v-divider></v-divider>
            <v-layout justify-center>
              <v-card-actions>
                <v-btn
                  color="error" block x-large
                  @click="openZoom">
                  Open in Zoom
                </v-btn>
              </v-card-actions>
            </v-layout>
          </v-card>
        </v-dialog>
    </div>
</template>
<script>
import Background from "./Background.vue";
import Sidebar from "./Sidebar.vue";
import Nextup from "./Nextup.vue";
import Sponsors from "./Sponsors.vue";

export default {
  computed: {
    dialog: function () {
      return "zoom_event_id" in this.$route.params;
    },
  },
  methods: {
    openZoom() {
      window.open("https://acm-org.zoom.us/j/7296249167");
    }
  },
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