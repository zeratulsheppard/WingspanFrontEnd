<script>
  export default {
    props: {
      pilot: Object,
      category: String
    },
    computed: {
      display() {
        const { value } = this.pilot;
        switch (this.categoryArr) {
          case 'count':
            return `${value} deliveries`;
          case 'value':
            return `${(value / 1e9).toFixed(2)}B ISK`;
          case 'damage':
            return `${(value / 1e6).toFixed(2)}M CRPs`;
          case 'dedication':
            return `${value} dedication index`;
          case 'diversity':
            return `${value} diversity index`;
          case 'points':
            return `${value} ZPs`;
          default:
            return value;
        }
      },
      categoryArr() {
        return this.category.split('_').pop();
      }
    }
  }
</script>

<template>
  <span v-html="display"></span>
</template>
