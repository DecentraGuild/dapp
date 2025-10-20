<template>
  <div v-if="isVisible" class="success-popup-overlay" @click="closePopup">
    <div class="success-popup" @click.stop>
      <div class="success-popup__header">
        <div class="success-popup__icon">
          <Icon :icon="icon" />
        </div>
        <button class="success-popup__close" @click="closePopup">
          <Icon icon="mdi:close" />
        </button>
      </div>
      
      <div class="success-popup__content">
        <h3 class="success-popup__title">{{ title }}</h3>
        <p class="success-popup__message">{{ message }}</p>
        
        <div v-if="details" class="success-popup__details">
          <div v-for="(detail, key) in details" :key="key" class="success-popup__detail">
            <span class="success-popup__detail-label">{{ key }}:</span>
            <span class="success-popup__detail-value">{{ detail }}</span>
          </div>
        </div>
      </div>
      
      <div class="success-popup__footer">
        <BaseButton
          variant="primary"
          size="md"
          @click="closePopup"
        >
          {{ buttonText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseButton } from '@/components/base'

interface Props {
  isVisible: boolean
  title: string
  message: string
  icon?: string
  details?: Record<string, string | number>
  buttonText?: string
  autoClose?: boolean
  autoCloseDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi:check-circle',
  buttonText: 'Got it!',
  autoClose: false,
  autoCloseDelay: 3000
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(props.isVisible)

watch(() => props.isVisible, (newValue) => {
  isVisible.value = newValue
  
  if (newValue && props.autoClose) {
    setTimeout(() => {
      closePopup()
    }, props.autoCloseDelay)
  }
})

const closePopup = () => {
  isVisible.value = false
  emit('close')
}
</script>

<style scoped>
.success-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.success-popup {
  background: var(--theme-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: var(--border-width-thin) solid var(--border-color-1);
}

.success-popup__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-color-0-20);
  border-radius: var(--border-radius-full);
  color: var(--success-color-0);
  font-size: 24px;
}

.success-popup__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  color: var(--text-color-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-popup__close:hover {
  background: var(--neutral-color-0-10);
  color: var(--text-color-1);
}

.success-popup__content {
  padding: var(--space-lg);
}

.success-popup__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.success-popup__message {
  font-size: var(--font-size-md);
  color: var(--text-color-1);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.5;
}

.success-popup__details {
  background: var(--neutral-color-0-5);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.success-popup__detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
  border-bottom: var(--border-width-thin) solid var(--border-color-1);
}

.success-popup__detail:last-child {
  border-bottom: none;
}

.success-popup__detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-2);
}

.success-popup__detail-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
}

.success-popup__footer {
  padding: var(--space-lg);
  border-top: var(--border-width-thin) solid var(--border-color-1);
  display: flex;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .success-popup {
    margin: var(--space-sm);
    max-width: none;
  }
  
  .success-popup__header,
  .success-popup__content,
  .success-popup__footer {
    padding: var(--space-md);
  }
  
  .success-popup__title {
    font-size: var(--font-size-lg);
  }
}
</style>

