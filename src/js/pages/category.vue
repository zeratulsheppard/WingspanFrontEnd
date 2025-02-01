<script setup>
import LayoutDefault from '../layouts/default.vue'
import ViewCategory from '../components/view-category.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <LayoutDefault>
    <ViewCategory :category="route.params.category"></ViewCategory>
  </LayoutDefault>
</template>
