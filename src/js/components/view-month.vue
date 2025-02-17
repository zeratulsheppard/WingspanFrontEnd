<script>
  import moment from 'moment';
  import { mapActions, mapGetters, mapState } from 'vuex';
  import { EventBus } from '../event-bus';

  import Leaderboard from './leaderboard.vue';
  import MonthSummary from './view-month/summary.vue';
  import NavigationBar from './navigation-bar.vue';
  import PilotIconWithMedals from './pilot-icon-with-medals.vue';
  import ShipIcon from './ship-icon.vue';
  import WeaponIcon from './weapon-icon.vue';

  import leaderboards from './view-month/registry-leaderboards';
  const realLeaderboards = JSON.parse(JSON.stringify(leaderboards));

  export default {
    props: {
      month: {
        type: Number,
        default: () => moment().month() + 1
      },
      year: {
        type: Number,
        default: () => moment().year()
      }
    },
    data() {
      return {
        monthData: this.month,
        yearData: this.year,
        leaderboards: realLeaderboards
      };
    },
    computed: {
      ...mapState({
        arePilotMedalsLoaded: state => state.pilot_medals.isLoaded,
        arePilotNamesLoaded: state => state.pilot_names.isLoaded,
        summary: state => state.month.summary,
      }),
      ...mapGetters([
        'getIsMonthLoaded',
        'getFirstInCategory',
        'getPilotName',
      ]),
      dedicated() {
        return this.getFirstInCategory('dedication');
      },
      diverse() {
        return this.getFirstInCategory('diversity');
      },
      diverseShips() {
        return this.diverse ? this.sort(this.diverse.ship_type_ids) : [];
      },
      diverseWeapons() {
        return this.diverse ? this.sort(this.diverse.weapon_type_ids) : [];
      },
      moment() {
        return moment(`${this.yearData}-${this.monthData}`);
      },
      date() {
        return { year: this.yearData, month: this.monthData };
      },
      monthName() {
        return this.moment.format('MMMM');
      },
      yearShort() {
        return this.moment.format('YY');
      },
    },
    methods: {
      ...mapActions([
        'loadMonth',
        'loadPilotMedalsFast',
        'loadPilotNamesFast',
      ]),
      setMonth(year, month) {
        this.monthData = Number(month);
        this.yearData = Number(year);
      },
      sort(arr) {
        return arr.sort((a, b) => +/\d+/.exec(a)[0] - +/\d+/.exec(b)[0]);
      }
    },
    created() {
      if (!this.getIsMonthLoaded(this.date)) {
        this.loadMonth(this.date);
      }

      if (!this.arePilotNamesLoaded) {
        this.loadPilotNamesFast();
      }

      if (!this.arePilotMedalsLoaded) {
        this.loadPilotMedalsFast();
      }

      EventBus.$on('month', ({ year, month }) => {
        this.setMonth(year, month);
        this.loadMonth(this.date);
      });
    },
    beforeDestroy() {
      EventBus.$off('month');
    },
    components: {
      Leaderboard,
      MonthSummary,
      NavigationBar,
      PilotIconWithMedals,
      ShipIcon,
      WeaponIcon
    },
  };
</script>

<template>
  <div>
    <div class="font-weight-bold text-center my-3">{{ monthName }}, YC1{{ yearShort }}</div>
    <month-summary></month-summary>
    <div class="month-leaderboards">
      <leaderboard type="value" title="Employee of the Month" title-description="Most ISK destroyed"></leaderboard>
      <leaderboard type="solo-value_value" title="Top Lone Enterprising Agent" title-description="Most ISK destroyed solo"></leaderboard>
      <leaderboard type="count" title="Deliveries"></leaderboard>
      <leaderboard type="solo-count_count" title="Solo" title-description="As it goes by zKillboard's solo rules"></leaderboard>
      <leaderboard type="zkb_points"></leaderboard>
    </div>
    <div v-if="dedicated" class="text-center my-3">
      <pilot-icon-with-medals :id="dedicated.character_id" category="dedication"></pilot-icon-with-medals>
      {{ getPilotName(dedicated.character_id) }} | Most dedicated pilot
      <span class="d-none d-md-inline">|</span><br class="d-block d-md-none">
      {{ dedicated.value }} deliveries on
      <ship-icon :id="dedicated.match.ship_type_id"></ship-icon><weapon-icon :id="dedicated.match.weapon_type_id"></weapon-icon>
    </div>
    <div v-if="diverse" class="text-center my-3">
      <pilot-icon-with-medals :id="diverse.character_id" category="diversity"></pilot-icon-with-medals>
      {{ getPilotName(diverse.character_id) }} | Most diverse pilot
      <span class="d-none d-md-inline">|</span><br class="d-block d-md-none">
      {{ diverse.value }} diversity index<br>
      <ship-icon v-for="id in diverseShips" :key="'r' + id" :id="id"></ship-icon><br>
      <weapon-icon v-for="id in diverseWeapons" :key="'t' + id" :id="id"></weapon-icon>
    </div>
    <navigation-bar></navigation-bar>
    <div class="month-leaderboards">
      <leaderboard v-for="(data, category) in leaderboards" :key="category" :type="category"></leaderboard>
    </div>
  </div>
</template>

<style lang="scss">
  .month-leaderboards {
    display: grid;
    grid-row-gap: 0.5em;

    @include media-breakpoint-up(md) {
      grid-template-columns: 1fr 1fr;
    }

    @include media-breakpoint-up(lg) {
      grid-template-columns: 1fr;
    }
  }
</style>
