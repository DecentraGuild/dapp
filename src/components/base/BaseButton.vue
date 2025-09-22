<template>
  <button
    :class="buttonClasses"
    :style="buttonStyles"
    :disabled="disabled"
    @click="handleClick"
  >
    <Icon v-if="icon" :icon="icon" class="button-icon" />
    <span v-if="$slots.default" class="button-text">
      <slot />
    </span>
    <Icon v-if="loading" icon="mdi:loading" class="button-loading" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { getPrimaryColor, getSecondaryColor, getEmergencyColor } = useSkinTheme()

const buttonClasses = computed(() => [
  'base-button',
  `button-${props.variant}`,
  `button-${props.size}`,
  {
    'button-full-width': props.fullWidth,
    'button-loading': props.loading,
    'button-disabled': props.disabled
  }
])

const buttonStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--emergency-color': getEmergencyColor()
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.base-button:focus {
  outline: 2px solid var(--secondary-color-0);
  outline-offset: 2px;
}

/* Variants */
.button-primary {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
}

.button-primary:hover:not(.button-disabled) {
  background: var(--secondary-color-1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
}

.button-secondary {
  background: var(--primary-color-1);
  color: var(--secondary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.button-secondary:hover:not(.button-disabled) {
  background: var(--secondary-color-2);
  transform: translateY(-1px);
}

.button-accent {
  background: var(--secondary-color-2);
  color: var(--secondary-color-0);
}

.button-accent:hover:not(.button-disabled) {
  background: var(--secondary-color-1);
  transform: translateY(-1px);
}

.button-outline {
  background: transparent;
  color: var(--secondary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.button-outline:hover:not(.button-disabled) {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
  transform: translateY(-1px);
}

.button-ghost {
  background: transparent;
  color: var(--secondary-color-0);
}

.button-ghost:hover:not(.button-disabled) {
  background: var(--secondary-color-2);
  transform: translateY(-1px);
}

.button-danger {
  background: var(--emergency-color);
  color: white;
}

.button-danger:hover:not(.button-disabled) {
  background: var(--emergency-color);
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--emergency-color);
}

/* Sizes */
.button-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-height: 1.75rem;
}

.button-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.button-md {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  min-height: 2.5rem;
}

.button-lg {
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  min-height: 3rem;
}

.button-xl {
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  min-height: 3.5rem;
}

/* States */
.button-full-width {
  width: 100%;
}

.button-loading {
  cursor: not-allowed;
}

.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.button-loading .button-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.button-icon {
  font-size: 1em;
  flex-shrink: 0;
}

.button-text {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .button-xs { padding: 0.2rem 0.4rem; font-size: 0.7rem; }
  .button-sm { padding: 0.4rem 0.6rem; font-size: 0.8rem; }
  .button-md { padding: 0.6rem 0.8rem; font-size: 0.8rem; }
  .button-lg { padding: 0.7rem 1rem; font-size: 0.9rem; }
  .button-xl { padding: 0.8rem 1.2rem; font-size: 1rem; }
}
</style>
