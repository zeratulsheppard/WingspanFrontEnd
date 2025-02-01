import axios from 'axios';
import localforage from 'localforage';

const alltime = {
  CACHE_HIT: 'ALLTIME_CACHE_HIT',
  LOAD_SUCCESS: 'ALLTIME_LOAD_SUCCESS',
  LOAD_FAIL: 'ALLTIME_LOAD_FAIL',
  REQUEST: 'ALLTIME_REQUEST'
};

export default {
  state: {
    data: {
      value: undefined,
      count: undefined,
      damage: undefined
    },
    isLoaded: false,
  },
  mutations: {
    [alltime.CACHE_HIT](state, data) {
      state.data = data;
      state.isLoaded = true;
    },
    [alltime.LOAD_SUCCESS](state, data) {
      state.data = data;
      state.isLoaded = true;
    },
  },
  actions: {
    async loadAlltimeFast({ commit, dispatch }) {
      try {
        const data = await localforage.getItem('alltime');
        if (data) {
          commit(alltime.CACHE_HIT, data);
        }
        await dispatch('loadAlltime');
      } catch (error) {
        console.log(error);
      }
    },
    async loadAlltime({ commit }) {
      commit(alltime.REQUEST);
      try {
        const res = await axios.get('/api/summary/');
        await localforage.setItem('alltime', res.data);
        commit(alltime.LOAD_SUCCESS, res.data);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
