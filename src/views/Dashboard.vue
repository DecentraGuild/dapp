<template>
  <div class="dashboard">
    <!-- Empty dashboard - just footer navigation unfolded -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useFooterState } from '../composables/useFooterState'

const { setDashboardMode } = useFooterState()

// Set dashboard mode to keep footer permanently expanded
onMounted(() => {
  setDashboardMode(true)
})

// Reset dashboard mode when leaving the dashboard
onUnmounted(() => {
  setDashboardMode(false)
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--global-bg-primary);
}
</style>
