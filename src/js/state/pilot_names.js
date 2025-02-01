import axios from 'axios';
import localforage from 'localforage';

const events = {
  CACHE_HIT: 'PILOT_NAMES_CACHE_HIT',
  LOAD_SUCCESS: 'PILOT_NAMES_LOAD_SUCCESS',
  LOAD_FAIL: 'PILOT_NAMES_LOAD_FAIL',
  REQUEST: 'PILOT_NAMES_REQUEST'
};

export default {
  state: {
    data: {},
    isLoaded: false,
  },
  getters: {
    getPilotName: state => id => {
      try { return state.data[id].name }
      catch (e) {}
    }
  },
  mutations: {
    [events.CACHE_HIT] (state, data) {
      state.data = data;
      state.isLoaded = true;
    },
    [events.LOAD_SUCCESS] (state, data) {
      state.data = data;
      state.isLoaded = true;
    },
  },
  actions: {
    async loadPilotNamesFast ({ commit, dispatch }) {
      try {
        const data = await localforage.getItem('pilot_names');
        if (data) {
          commit(events.CACHE_HIT, data);
        }
        await dispatch('loadPilotNames');
      } catch (error) {
        console.log(error);
      }
    },
    async loadPilotNames ({ commit }) {
      commit(events.REQUEST);
      try {
        const res = await axios.get('/api/pilot/names/');
        const ret = {};
        for (let pilot of res.data) {
          ret[pilot._id] = pilot;
        }
        await localforage.setItem('pilot_names', ret);
        commit(events.LOAD_SUCCESS, ret);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
