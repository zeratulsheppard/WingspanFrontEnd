import axios from 'axios';
import localforage from 'localforage';

import default_state from '../components/view-month/registry-leaderboards';

const real_default_state = JSON.parse(JSON.stringify(default_state));

const events = {
  CACHE_HIT: 'CATEGORY_CACHE_HIT',
  LOAD_SUCCESS: 'CATEGORY_LOAD_SUCCESS',
  LOAD_FAIL: 'CATEGORY_LOAD_FAIL',
  REQUEST: 'CATEGORY_REQUEST'
};

export default {
  state: {
    ...real_default_state
  },
  mutations: {
    [events.CACHE_HIT](state, { category, data }) {
      state[category].data = data;
    },
    [events.LOAD_SUCCESS](state, { category, data }) {
      state[category].data = data;
    },
  },
  actions: {
    async loadCategoryCache({ commit, dispatch }, { category }) {
      try {
        const data = await localforage.getItem(`${category}-alltime`);
        if (data) {
          commit(events.CACHE_HIT, { category, data });
          return true;
        } else {
          await dispatch('loadCategory', { category });
          return false;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async loadCategoryFast({ dispatch }, { category }) {
      try {
        const status = await dispatch('loadCategoryCache', { category });
        if (status) {
          await dispatch('loadCategory', { category });
        }
      } catch (error) {
        console.log(error);
      }
    },
    async loadCategory({ commit }, { category }) {
      commit(events.REQUEST);
      try {
        const response = await axios.get(`/api/category/${category}/`);
        const data = response.data;
        await localforage.setItem(`${category}-alltime`, data);
        commit(events.LOAD_SUCCESS, { category, data });
      } catch (error) {
        console.log(error);
      }
    }
  }
}
