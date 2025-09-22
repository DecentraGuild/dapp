<template>
  <div 
    :class="cardClasses"
    :style="cardStyles"
  >
    <!-- Card Header -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  title?: string
  subtitle?: string
  hover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  hover: false,
  clickable: false
})

const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

const cardClasses = computed(() => [
  'base-card',
  `card-${props.variant}`,
  `card-${props.size}`,
  {
    'card-hover': props.hover,
    'card-clickable': props.clickable
  }
])

const cardStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2)
}))
</script>

<style scoped>
.base-card {
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-0);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color-1);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Variants */
.card-primary {
  background: var(--primary-color-0);
  border-color: var(--secondary-color-0);
}

.card-secondary {
  background: var(--primary-color-1);
  border-color: var(--secondary-color-1);
}

.card-accent {
  background: var(--secondary-color-2);
  border-color: var(--secondary-color-0);
}

.card-neutral {
  background: var(--primary-color-2);
  border-color: var(--secondary-color-2);
}

/* Sizes */
.card-sm {
  padding: 0.75rem;
}

.card-md {
  padding: 1rem;
}

.card-lg {
  padding: 1.5rem;
}

.card-xl {
  padding: 2rem;
}

.card-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color-0);
  margin: 0 0 0.25rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-1);
  margin: 0;
  opacity: 0.8;
}

.card-body {
  flex: 1;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: var(--border-width-thin) solid var(--secondary-color-2);
}

/* Responsive */
@media (max-width: 768px) {
  .card-sm { padding: 0.5rem; }
  .card-md { padding: 0.75rem; }
  .card-lg { padding: 1rem; }
  .card-xl { padding: 1.25rem; }
  
  .card-title {
    font-size: 1.125rem;
  }
  
  .card-subtitle {
    font-size: 0.8rem;
  }
}
</style>
