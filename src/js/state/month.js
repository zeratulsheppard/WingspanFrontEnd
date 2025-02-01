import axios from 'axios';
import localforage from 'localforage';
import default_state from '../components/view-month/registry-leaderboards';
import sleep from '../utility/sleep';

const real_default_state = JSON.parse(JSON.stringify(default_state));

const events = {
  CACHE_HIT: 'MONTH_CACHE_HIT',
  CACHE_LOADED: 'MONTH_CACHE_LOADED',
  REMOTE_REQUEST: 'MONTH_REMOTE_REQUEST',
  REMOTE_FAIL: 'MONTH_REMOTE_FAIL',
  REMOTE_SUCCESS: 'MONTH_REMOTE_SUCCESS',
  REMOTE_LOADED: 'MONTH_REMOTE_LOADED',
  DATA_NOT_LOADED: 'MONTH_DATA_NOT_LOADED',
  DATA_LOADED: 'MONTH_DATA_LOADED',
  DATA_SUMMARY: 'MONTH_DATA_SUMMARY',
  DATA_PATCH: 'MONTH_DATA_PATCH',
};

const getStringFromDate = ({ year, month }) => `${year}-${month}`;

export default {
  state: {
    data: { ...real_default_state },
    summary: {
      count: null,
      damage: null,
      value: null,
    },
    isLoaded: false,
    months: {},
  },
  getters: {
    getMonth: (state) => (date) => {
      try {
        return state.months[getStringFromDate(date)];
      } catch (e) {
        return null;
      }
    },
    getIsMonthLoaded: (state, getters) => (date) => {
      try {
        return getters.getMonth(date).isLoaded;
      } catch (e) {
        return false;
      }
    },
    getCategory: (state) => (category) => {
      try {
        return state.data[category].data;
      } catch (e) {
        return null;
      }
    },
    getFirstInCategory: (state, getters) => (category) => {
      try {
        return getters.getCategory(category)[0];
      } catch (e) {
        return null;
      }
    },
  },
  mutations: {
    [events.DATA_NOT_LOADED](state) {
      state.isLoaded = false;
    },
    [events.DATA_LOADED](state) {
      state.isLoaded = true;
    },
    [events.DATA_SUMMARY](state, { summary }) {
      state.summary = summary;
    },
    [events.DATA_PATCH](state, { category, data }) {
      if (!state.data[category]) {
        return;
      }
      state.data[category].data = data;
    },
  },
  actions: {
    async loadMonth({ commit, dispatch }, date) {
      commit(events.DATA_NOT_LOADED, date);

      const { year, month } = date;
      const data = await localforage.getItem(`month-${year}-${month}`);
      const isMonthInCache = !!data;

      if (isMonthInCache && moment().diff(moment().year(year).month(month), 'months') > 1) {
        await dispatch('loadMonthFromCache', date);
        return;
      }

      await dispatch('loadMonthFromAPI', date);
    },
    async loadMonthFromCache({ commit, dispatch }, date) {
      const { year, month } = date;
      const data = await localforage.getItem(`month-${year}-${month}`);

      if (!data) {
        return false;
      }

      commit(events.CACHE_HIT, date);
      await dispatch('processData', { year, month, data });
      commit(events.CACHE_LOADED, date);
      return true;
    },
    async loadMonthFromAPI({ commit, dispatch }, date) {
      const { year, month } = date;

      commit(events.REMOTE_REQUEST, date);
      const res = await axios.get(`/api/month/${year}/${month}/`);
      const data = res.data;

      if (!data) {
        commit(events.REMOTE_FAIL, date);
        return false;
      }

      commit(events.REMOTE_SUCCESS, date);
      await dispatch('saveDataToCache', { year, month, data });
      await dispatch('processData', { year, month, data });
      commit(events.REMOTE_LOADED, date);
      return true;
    },
    async saveDataToCache(_, { year, month, data }) {
      await localforage.setItem(`month-${year}-${month}`, data);
    },
    async processData({ commit }, { year, month, data }) {
      commit(events.DATA_SUMMARY, { summary: data.summary });
      await sleep(0);

      const categories = [
        'value',
        'solo-value_value',
        'count',
        'solo-count_count',
        'zkb_points',
        'dedication',
        'diversity',
      ];

      for (const category of categories) {
        commit(events.DATA_PATCH, { category, data: data[category] });
        await sleep(0);
      }

      const keys = Object.keys(data).filter(
        (category) => !categories.includes(category) && category !== 'summary'
      );

      for (const category of keys) {
        commit(events.DATA_PATCH, { category, data: data[category] });
        await sleep(0);
      }

      commit(events.DATA_LOADED, { year, month });
      await sleep(0);
    },
  },
};
