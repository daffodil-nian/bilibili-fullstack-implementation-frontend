<template>
  <div class="space-page">
    <h2>个人空间</h2>
    <p>UID: {{ uid }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const uid = computed(() => route.params.uid)
</script>

<style scoped>
.space-page {
  padding: 24px;
}
</style>
