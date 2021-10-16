import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store/store'

import VideoPlayer from './components/VideoPlayer.vue';
import Filler from './components/Filler.vue';
import TimeRemaining from './components/messages/TimeRemaining.vue';
import Setup from './components/Setup.vue';

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(VueRouter)

const routes = [
  { path: '/player/:event_id', component: VideoPlayer },
  { path: '/filler/', 
    component: Filler,
    children: [
      {
        path: 'remaining',
        component: TimeRemaining
      }
    ] 
  },
  { path: '/filler/zoom/:zoom_event_id', 
    component: Filler,
    children: [
      {
        path: 'remaining',
        component: TimeRemaining
      }
    ] 
  },
  {
    path: '/setup/room/:room_name/mode/:mode',
    component: Setup
  }
];
const router = new VueRouter({routes})

new Vue({
  render: h => h(App),
  vuetify,
  store: store,
  router
}).$mount('#app')
router.replace("/filler")