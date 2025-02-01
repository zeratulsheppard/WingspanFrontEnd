import axios from 'axios';
import localforage from 'localforage';

const events = {
  CACHE_HIT: 'PILOT_MEDALS_CACHE_HIT',
  LOAD_SUCCESS: 'PILOT_MEDALS_LOAD_SUCCESS',
  LOAD_FAIL: 'PILOT_MEDALS_LOAD_FAIL',
  REQUEST: 'PILOT_MEDALS_REQUEST'
};

export default {
  state: {
    data: {},
    isLoaded: false,
  },
  getters: {
    getPilotMedals: state => id => {
      try {
        return state.data[id]?.medals;
      } catch (e) {
        console.error(e);
      }
    },
    getPilotCategoryMedals: (state, getters) => (id, category) => {
      try {
        return getters.getPilotMedals(id)?.[category];
      } catch (e) {
        console.error(e);
      }
    }
  },
  mutations: {
    [events.CACHE_HIT](state, data) {
      state.data = data;
      state.isLoaded = true;
    },
    [events.LOAD_SUCCESS](state, data) {
      state.data = data;
      state.isLoaded = true;
    },
  },
  actions: {
    async loadPilotMedalsFast({ commit, dispatch }) {
      try {
        const data = await localforage.getItem('pilot_medals');
        if (data) {
          commit(events.CACHE_HIT, data);
        }
        await dispatch('loadPilotMedals');
      } catch (error) {
        console.error(error);
      }
    },
    async loadPilotMedals({ commit }) {
      commit(events.REQUEST);
      try {
        const res = await axios.get('/api/pilot/medals/');
        const data = res.data.reduce((acc, pilot) => {
          acc[pilot._id] = pilot;
          return acc;
        }, {});
        await localforage.setItem('pilot_medals', data);
        commit(events.LOAD_SUCCESS, data);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
