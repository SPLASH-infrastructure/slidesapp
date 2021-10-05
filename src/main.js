import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store/store'

Vue.config.productionTip = false
Vue.use(Vuex)

new Vue({
  render: h => h(App),
  vuetify,
  store: store
}).$mount('#app')
