<template>
  <div 
    class="submenu"
    :style="submenuStyles"
    @click.stop
  >
    <div class="submenu-header">
      <h3 class="submenu-title">{{ item.label }}</h3>
      <button 
        class="submenu-close"
        @click="$emit('close')"
        :style="{ color: getSecondaryColor(0) }"
      >
        <Icon icon="mdi:close" />
      </button>
    </div>
    
    <div class="submenu-items">
      <button
        v-for="subItem in item.submenuItems"
        :key="subItem.id"
        class="submenu-item"
        @click="handleSubItemClick(subItem)"
        :style="submenuItemStyles"
      >
        <Icon :icon="subItem.icon" class="submenu-item-icon" />
        <div class="submenu-item-content">
          <span class="submenu-item-label">{{ subItem.label }}</span>
          <span 
            v-if="subItem.description" 
            class="submenu-item-description"
          >
            {{ subItem.description }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../composables/useSkinTheme'
import type { NavigationItem } from '../types'

// Props
interface Props {
  item: NavigationItem
  position: { x: number; y: number }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  navigate: [item: NavigationItem]
}>()

// Composables
const { getPrimaryColor, getSecondaryColor } = useSkinTheme()

// Computed styles
const submenuStyles = computed(() => {
  // Ensure submenu stays within viewport bounds
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const submenuWidth = 300 // min-width from CSS
  const submenuHeight = 200 // estimated height
  
  let x = props.position.x
  let y = props.position.y
  
  // Adjust horizontal position if submenu would go off-screen
  if (x + submenuWidth > viewportWidth) {
    x = viewportWidth - submenuWidth - 20 // 20px margin
  }
  if (x < 20) {
    x = 20 // 20px margin from left edge
  }
  
  // Adjust vertical position if submenu would go off-screen
  if (y + submenuHeight > viewportHeight) {
    y = viewportHeight - submenuHeight - 20 // 20px margin
  }
  if (y < 20) {
    y = 20 // 20px margin from top edge
  }
  
  return {
    '--primary-color': getPrimaryColor(0),
    '--secondary-color': getSecondaryColor(0),
    '--secondary-color-2': getSecondaryColor(1),
    '--secondary-color-3': getSecondaryColor(2),
    left: `${x}px`,
    top: `${y}px`
  }
})

const submenuItemStyles = computed(() => ({
  '--secondary-color': getSecondaryColor(0),
  '--secondary-color-2': getSecondaryColor(1)
}))

// Methods
const handleSubItemClick = (subItem: NavigationItem) => {
  emit('navigate', subItem)
}
</script>

<style scoped>
.submenu {
  position: fixed;
  background: var(--primary-color);
  border: var(--border-width-thin) solid var(--secondary-color-3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 400px;
  z-index: 1002;
  backdrop-filter: blur(10px);
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.submenu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: var(--border-width-thin) solid var(--secondary-color-3);
}

.submenu-title {
  margin: 0;
  color: var(--secondary-color);
  font-size: 1.2rem;
  font-weight: 600;
}

.submenu-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.submenu-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.submenu-items {
  padding: 0.5rem;
}

.submenu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.submenu-item:hover {
  background-color: var(--secondary-color-2);
  transform: translateX(4px);
}

.submenu-item-icon {
  font-size: 1.5rem;
  color: var(--secondary-color);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.submenu-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.submenu-item-label {
  color: var(--secondary-color);
  font-weight: 500;
  font-size: 0.95rem;
}

.submenu-item-description {
  color: var(--secondary-color-2);
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Responsive design */
@media (max-width: 768px) {
  .submenu {
    min-width: 250px;
    max-width: 300px;
  }
  
  .submenu-header {
    padding: 0.75rem 1rem;
  }
  
  .submenu-title {
    font-size: 1.1rem;
  }
  
  .submenu-item {
    padding: 0.6rem 0.75rem;
  }
  
  .submenu-item-icon {
    font-size: 1.3rem;
    margin-right: 0.5rem;
  }
}
</style>
