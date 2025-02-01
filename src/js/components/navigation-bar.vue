<script>
  import moment from 'moment';
  import { EventBus } from '../event-bus';

  export default {
    data() {
      return {
        year: 2014,
        month: '07',
        today: moment(),
      };
    },
    methods: {
      navigate(e) {
        const { year, month } = e.target.dataset;
        EventBus.$emit('month', { year, month });
        this.updateActiveMonth(e.target);
        this.scrollToMonth(e.target);
      },
      getMonths() {
        return document.getElementsByClassName('month');
      },
      updateActiveMonth(target) {
        this.removeActiveClass();
        this.addActiveClass(target);
      },
      removeActiveClass() {
        const months = this.getMonths();
        for (let month of months) {
          month.classList.remove('active');
        }
      },
      addActiveClass(node) {
        node.classList.add('active');
      },
      scrollToMonth(node) {
        const nodeOffset = node.offsetLeft;
        const scrollerWidth = this.$refs.scroller.scrollWidth;
        const timelineWidth = this.$refs.timeline.clientWidth;
        const halfTimelineWidth = timelineWidth / 2;

        if (nodeOffset > scrollerWidth - halfTimelineWidth) {
          this.$refs.timeline.scrollLeft = scrollerWidth - timelineWidth;
        } else if (nodeOffset < halfTimelineWidth) {
          this.$refs.timeline.scrollLeft = 0;
        } else {
          this.$refs.timeline.scrollLeft = nodeOffset + node.clientWidth / 2 - halfTimelineWidth;
        }
      },
    },
    computed: {
      years() {
        const timestamp = moment(`${this.year}-${this.month}`);
        const years = {};

        do {
          const year = timestamp.year();
          const months = [];

          do {
            months.push(timestamp.clone());
            timestamp.add(1, 'month');
          } while (this.today > timestamp && timestamp.month() !== 0);

          years[year] = months;
        } while (this.today > timestamp);

        return years;
      },
    },
    mounted() {
      const months = this.getMonths();
      const lastMonthNode = months[months.length - 1];
      this.updateActiveMonth(lastMonthNode);
      this.scrollToMonth(lastMonthNode);
    },
  };
</script>

<template>
  <div class="timeline my-md-3" ref="timeline">
    <div class="scroller" ref="scroller">
      <div v-for="(months, year) in years" :key="year" class="year px-3">
        <div class="text-center">{{ year }}</div>
        <div class="months-wrap">
          <div
            v-for="month in months"
            :key="month.format('YYYY-MM')"
            @click="navigate"
            class="month py-1 px-3"
            :data-year="month.year()"
            :data-month="month.month() + 1"
          >
            {{ month.format('MMM') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .timeline {
    overflow-x: scroll;
    overflow-y: hidden;
    border: 1px solid #818a91;
    background: #fff;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    height: 80px;

    @include media-breakpoint-up(md) {
      position: relative;
      bottom: unset;
      left: unset;
      right: unset;
      z-index: unset;
      height: 100px;
    }

    .bg-night & {
      background: #111;
    }
  }

  .scroller {
    position: absolute;
    white-space: nowrap;
    padding: 0.5rem 1rem;
    transition: 1s ease-in-out;
  }

  .year {
    display: inline-grid;
    grid-template-rows: min-content min-content;
    grid-row-gap: 0.25em;
    border-right: 1px solid #818a91;

    &:first-child {
      border-left: 1px solid #818a91;
    }
  }

  .months-wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    grid-column-gap: 0.25em;
  }

  .month {
    display: grid;
    align-items: center;
    justify-items: center;
    border: 1px solid darken($color-timeline-month, 10%);
    background: $color-timeline-month;
    border-radius: 0.25rem;

    &.active {
      background-color: $color-timeline-month-active;
      border-color: darken($color-timeline-month-active, 10%);
    }

    .bg-night & {
      background: $color-night-timeline-month;
      border-color: darken($color-night-timeline-month, 10%);

      &.active {
        background: $color-night-timeline-month-active;
        border-color: darken($color-night-timeline-month-active, 10%);
      }
    }
  }
</style>
