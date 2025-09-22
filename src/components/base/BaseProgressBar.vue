<template>
  <div :class="progressClasses" :style="progressStyles">
    <div v-if="label" class="progress-label">
      <span class="progress-label-text">{{ label }}</span>
      <span v-if="showValue" class="progress-value">{{ displayValue }}</span>
    </div>
    
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="fillStyles"
        :class="{ 'progress-fill-animated': animated }"
      >
        <div v-if="showInnerLabel && innerLabel" class="progress-inner-label">
          {{ innerLabel }}
        </div>
      </div>
    </div>
    
    <div v-if="description" class="progress-description">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface Props {
  value: number
  max?: number
  label?: string
  description?: string
  innerLabel?: string
  showValue?: boolean
  showInnerLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  animated?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showValue: true,
  showInnerLabel: false,
  size: 'md',
  variant: 'default',
  animated: false,
  height: undefined
})

const { getPrimaryColor, getSecondaryColor } = useSkinTheme()

const progressClasses = computed(() => [
  'base-progress',
  `progress-${props.size}`,
  `progress-${props.variant}`
])

const progressStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2)
}))

const percentage = computed(() => {
  const val = Math.max(0, Math.min(props.value, props.max))
  return (val / props.max) * 100
})

const displayValue = computed(() => {
  if (props.showValue) {
    return `${Math.round(percentage.value)}%`
  }
  return ''
})

const fillStyles = computed(() => {
  const styles: Record<string, any> = {
    width: `${percentage.value}%`
  }
  
  if (props.height) {
    styles.height = props.height
  }
  
  return styles
})
</script>

<style scoped>
.base-progress {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label-text {
  font-weight: 500;
  color: var(--secondary-color-0);
  font-size: 0.875rem;
}

.progress-value {
  font-weight: 600;
  color: var(--secondary-color-1);
  font-size: 0.875rem;
}

.progress-track {
  width: 100%;
  background: var(--secondary-color-2);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary-color-0), var(--secondary-color-1));
  border-radius: 9999px;
  position: relative;
  transition: width 0.3s ease;
}

.progress-fill-animated {
  background: linear-gradient(
    90deg,
    var(--secondary-color-0),
    var(--secondary-color-1),
    var(--secondary-color-0)
  );
  background-size: 200% 100%;
  animation: progress-shimmer 2s infinite;
}

.progress-inner-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--primary-color-0);
  font-weight: 600;
  font-size: 0.75rem;
  white-space: nowrap;
  text-shadow: 0 1px 2px var(--primary-color-2);
}

.progress-description {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--secondary-color-1);
  opacity: 0.8;
}

/* Sizes */
.progress-sm .progress-track {
  height: 0.5rem;
}

.progress-sm .progress-label-text,
.progress-sm .progress-value {
  font-size: 0.75rem;
}

.progress-sm .progress-description {
  font-size: 0.7rem;
}

.progress-md .progress-track {
  height: 0.75rem;
}

.progress-lg .progress-track {
  height: 1rem;
}

.progress-lg .progress-label-text,
.progress-lg .progress-value {
  font-size: 1rem;
}

.progress-lg .progress-description {
  font-size: 0.875rem;
}

/* Variants */
.progress-success .progress-fill {
  background: linear-gradient(90deg, var(--secondary-color-0), var(--secondary-color-1));
}

.progress-warning .progress-fill {
  background: linear-gradient(90deg, var(--secondary-color-1), var(--secondary-color-2));
}

.progress-error .progress-fill {
  background: linear-gradient(90deg, var(--text-color-2), var(--secondary-color-2));
}

.progress-info .progress-fill {
  background: linear-gradient(90deg, var(--text-color-0), var(--text-color-1));
}

/* Animation */
@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
