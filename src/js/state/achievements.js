import axios from 'axios';
import localforage from 'localforage';

import default_state from '../components/view-achievements/registry';

const real_default_state = JSON.parse(JSON.stringify(default_state));

const events = {
  CACHE_HIT: 'ACHIEVEMENTS_CACHE_HIT',
  LOAD_SUCCESS: 'ACHIEVEMENTS_LOAD_SUCCESS',
  LOAD_FAIL: 'ACHIEVEMENTS_LOAD_FAIL',
  REQUEST: 'ACHIEVEMENTS_REQUEST'
};

export default {
  state: {
    data: {
      ...real_default_state
    },
    isLoaded: false
  },
  mutations: {
    [events.CACHE_HIT](state, data) {
      Object.keys(real_default_state).forEach(key => {
        state.data[key].data = [];
      });

      data.forEach(pilot => {
        pilot.achievements.forEach(achievement => {
          const key = achievement.id;
          state.data[key].data.push({ character_id: pilot._id, killmail: achievement.killmail });
        });
      });

      state.isLoaded = true;
    },
    [events.LOAD_SUCCESS](state, data) {
      Object.keys(real_default_state).forEach(key => {
        state.data[key].data = [];
      });

      data.forEach(pilot => {
        pilot.achievements.forEach(achievement => {
          const key = achievement.id;
          state.data[key].data.push({ character_id: pilot._id, killmail: achievement.killmail });
        });
      });

      state.isLoaded = true;
    },
  },
  actions: {
    async loadAchievementsFast({ commit, dispatch }) {
      try {
        const data = await localforage.getItem('achievements');
        if (data) {
          commit(events.CACHE_HIT, data);
        }
        await dispatch('loadAchievements');
      } catch (error) {
        console.log(error);
      }
    },
    async loadAchievements({ commit }) {
      commit(events.REQUEST);
      try {
        const { data } = await axios.get('/api/achievements/');
        await localforage.setItem('achievements', data);
        commit(events.LOAD_SUCCESS, data);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
