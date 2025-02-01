import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import router from './router';
import store from './store';

Vue.use(Vuex);
Vue.use(VueRouter);

new Vue({
  router,
  store,
  render: h => h('router-view'),
}).$mount('#vue-root');
