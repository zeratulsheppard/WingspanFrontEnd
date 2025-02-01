<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import localforage from 'localforage';

import ViewAllTime from '../components/view-alltime.vue';

const store = useStore();
const router = useRouter();

const darkMode = computed(() => store.state.user.settings.darkMode);
const cssClassesRoot = computed(() => darkMode.value ? 'bg-night text-light' : '');
const switchText = computed(() => darkMode.value ? 'Return to light' : 'Join the dark side');

const hasUser = computed(() => store.getters.hasUser);

const navigate = (e) => {
  e.preventDefault();
  router.push({ name: e.target.dataset.name });
};

const reset = (e) => {
  e.preventDefault();
  localforage.clear().then(() => location.reload());
};

const track = (e) => {
  e.preventDefault();
  location.href = 'https://login.eveonline.com/oauth/authorize/?response_type=token&client_id=51c4a940a2464ea98df98c8f0dc1bf71&redirect_uri=https://wds-stats.secondfry.ru/track/';
};

const switchSide = (e) => {
  e.preventDefault();
  store.dispatch('setNight', !darkMode.value);
};

onMounted(() => {
  store.dispatch('loadSettings');
  store.dispatch('loadUserId');
});
</script>

<template>
  <div id="root" :class="cssClassesRoot">
    <nav class="navbar navbar-dark bg-dark navbar-expand-lg">
      <div class="container">
        <a class="navbar-brand" href="/" data-name="root" @click="navigate">Wingspan Delivery Services Statistics</a>
        <ul class="navbar-nav w-100">
          <li class="nav-item mr-auto">
            <a class="nav-item nav-link" href="/achievements" data-name="achievements" @click="navigate">Achievements</a>
          </li>
          <li class="nav-item">
            <a class="nav-item nav-link" href="#" @click="switchSide" v-text="switchText"></a>
          </li>
          <li class="nav-item">
            <a class="nav-item nav-link" href="#" @click="reset">Reset</a>
          </li>
          <li class="nav-item" v-if="!hasUser">
            <a class="nav-item nav-link" href="#" @click="track">Track your character</a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container my-3">
      <view-all-time></view-all-time>
      <slot></slot>
    </div>
    <div class="sf-footer pt-3 text-center bg-dark text-light">
      <footer class="container">
        <p>
          Yours truly, <a href="https://github.com/secondfry/">SecondFry</a> (<a
            href="https://zkillboard.com/character/91435934/">Lenai Chelien</a>).<br>
          Adapted for web by in January, 2016.<br>
          Rewritten in March, 2016.<br>
          Rewritten in March, 2018. Consistency!<br>
          Also check <a target="_blank" href="https://www.youtube.com/user/SecondFry" rel="noopener">my YouTube channel</a> :P.
        </p>
        <p class="mb-0">Original idea by <a href="https://zkillboard.com/character/92805979/">Valtyr Farshield</a>.</p>
      </footer>
    </div>
  </div>
</template>

<style lang="scss">
.sf-footer {
  padding-bottom: 80px;
}
.bg-night {
  background: $color-night !important;

  a {
    color: $color-night-a;
  }

  .bg-success {
    background: $color-night-success !important;
  }

  .table {
    color: $gray-100 !important;
  }
}
</style>
