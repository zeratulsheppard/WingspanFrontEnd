<script setup>
import { computed } from 'vue'
import AsyncImage from './async-image.vue'
import { defineProps } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const template = computed(() => `https://imageserver.eveonline.com/Type/${props.id}`)
</script>

<template>
  <AsyncImage :template="template" size="small" format="png" />
</template>
