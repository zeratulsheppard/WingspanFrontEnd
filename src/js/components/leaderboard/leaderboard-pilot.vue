<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import PilotIconWithMedals from '../pilot-icon-with-medals.vue'
import LeaderboardTicker from '../leaderboard/leaderboard-ticker.vue'

const props = defineProps(['category', 'pilot', 'listLength'])

const store = useStore()

const getPilotName = computed(() => store.getters.getPilotName)
const hasUser = computed(() => store.getters.hasUser)

const placeClass = computed(() => {
  switch (props.pilot.place) {
    case 1: return 'place-gold'
    case 2: return 'place-silver'
    case 3: return 'place-bronze'
    case 4: return 'place-wingspan'
    default: return 'place-haxxor'
  }
})

const size = computed(() => {
  switch (props.listLength) {
    case 1: return 'large'
    default: return 'small'
  }
})

const sizeClass = computed(() => {
  switch (props.listLength) {
    case 1: return 'place-large'
    default: return 'place-small'
  }
})

const change = computed(() => {
  if (props.pilot.change === false || props.pilot.change === 0) {
    return ''
  }
  return props.pilot.change
})

const glyphClass = computed(() => {
  if (props.pilot.change > 0) {
    return 'glyphicon glyphicon-chevron-up text-success'
  }
  if (props.pilot.change < 0) {
    return 'glyphicon glyphicon-chevron-down text-danger'
  }
  if (props.pilot.change === 0) {
    return 'glyphicon glyphicon-pause text-muted'
  }
  return 'glyphicon glyphicon-asterisk text-muted'
})
</script>

<template>
  <div :class="['place', sizeClass]">
    <div :class="['h-100', placeClass]"></div>
    <pilot-icon-with-medals :id="pilot.character_id" :size="size" :category="category"></pilot-icon-with-medals>
    <a class="place-name ml-2">
      <div class="small">
        #{{ pilot.place }} <small><span :class="glyphClass"></span> {{ change }}</small>
      </div>
      {{ getPilotName(pilot.character_id) }}
      <br v-if="size === 'large' || hasUser">
      <span v-if="size === 'small' && !hasUser">–</span>
      <leaderboard-ticker :category="category" :pilot="pilot"></leaderboard-ticker>
    </a>
  </div>
</template>

<style lang="scss">
  .place {
    display: grid;
    align-items: center;
    line-height: 1.4;

    &.place-small {
      grid-template-columns: 0.5em 32px auto;
      line-height: 1.2;
    }
    &.place-large {
      grid-template-columns: 0.5em 64px auto;
      min-height: 72px;
    }
  }
  .place-gold {
    background: $color-first;
  }
  .place-silver {
    background: $color-second;
  }
  .place-bronze {
    background: $color-third;
  }
  .place-wingspan {
    background: $color-wingspan;
  }
</style>
