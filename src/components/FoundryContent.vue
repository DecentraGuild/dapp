<template>
  <div class="foundry-content">
    <div class="content-header">
      <Icon :icon="icon" class="content-icon" />
      <h2 class="content-title">{{ title }}</h2>
      <p class="content-description">{{ description }}</p>
    </div>
    
    <div class="content-body">
      <div class="placeholder-content">
        <p>{{ title }} functionality will be implemented here</p>
        <p>This will include:</p>
        <ul>
          <li v-for="feature in features" :key="feature">{{ feature }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  icon: string
  title: string
  description: string
  features: readonly string[]
}

defineProps<Props>()
</script>

<style scoped>
.foundry-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--space-lg);
}

.content-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.content-icon {
  font-size: 3rem;
  color: var(--secondary-color-0);
}

.content-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-color-0);
  margin: 0;
}

.content-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin: 0;
  max-width: 500px;
}

.content-body {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: var(--text-color-1);
}

.placeholder-content ul {
  text-align: left;
  margin-top: var(--space-md);
}

.placeholder-content li {
  margin-bottom: var(--space-sm);
}
</style>
