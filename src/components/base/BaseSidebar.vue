<template>
  <div 
    :class="sidebarClasses"
    :style="sidebarStyles"
  >
    <div 
      v-for="(item, index) in items" 
      :key="item.id || index"
      :class="[
        ...itemClasses,
        {
          'item-active': item.active,
          'item-disabled': item.disabled
        }
      ]"
      :style="itemStyles"
      @click="handleItemClick(item, index)"
    >
      <!-- Square Icon -->
      <div class="sidebar-item-icon">
        <Icon :icon="item.icon" class="icon" />
      </div>
      
      <!-- Title -->
      <div class="sidebar-item-title">{{ item.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '@/composables/useSkinTheme'

interface SidebarItem {
  id?: string
  icon: string
  title: string
  active?: boolean
  disabled?: boolean
  action?: () => void
}

interface Props {
  items: SidebarItem[]
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  position?: 'left' | 'right'
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  position: 'left',
  width: '4rem'
})

const emit = defineEmits<{
  itemClick: [item: SidebarItem, index: number]
}>()

const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

// Get secondary color 3 (index 2) for active state
const getSecondaryColor3 = () => getSecondaryColor(2)

const sidebarClasses = computed(() => [
  'base-sidebar',
  `variant-${props.variant}`,
  `position-${props.position}`,
  {
    'sidebar-hover': true
  }
])

const itemClasses = computed(() => [
  'sidebar-item',
  {
    'item-hover': true,
    'item-clickable': true,
    'item-active': false, // Will be set per item
    'item-disabled': false // Will be set per item
  }
])

const sidebarStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--secondary-color-3': getSecondaryColor3(),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2),
  '--border-radius-sm': getBorderRadius('sm'),
  '--border-radius-md': getBorderRadius('md'),
  '--border-radius-lg': getBorderRadius('lg'),
  '--border-radius-xl': getBorderRadius('xl'),
  '--sidebar-width': props.width
}))

const itemStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--secondary-color-3': getSecondaryColor3(),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2),
  '--border-radius-sm': getBorderRadius('sm'),
  '--border-radius-md': getBorderRadius('md'),
  '--border-radius-lg': getBorderRadius('lg'),
  '--border-radius-xl': getBorderRadius('xl')
}))

const handleItemClick = (item: SidebarItem, index: number) => {
  if (item.disabled) return
  
  if (item.action) {
    item.action()
  }
  
  emit('itemClick', item, index)
}
</script>

<style scoped>
.base-sidebar {
  display: flex;
  flex-direction: column;
  width: v-bind(width);
  min-height: 12.5rem;
  max-height: 70vh;
  height: auto;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--z-fixed);
  background: var(--primary-color-1);
  border-right: var(--component-border-width) solid var(--secondary-color-2);
  border-top-right-radius: var(--border-radius-lg);
  border-bottom-right-radius: var(--border-radius-lg);
  padding: var(--space-sm) 0;
  gap: 2px;
  overflow-y: auto;
  transition: all var(--transition-normal);
}

.position-left {
  left: 0;
}

.position-right {
  right: 0;
  border-right: none;
  border-left: var(--component-border-width) solid var(--secondary-color-2);
}

/* Variants */
.variant-primary {
  background: var(--primary-color-1);
  border-color: var(--secondary-color-2);
}

.variant-secondary {
  background: var(--primary-color-2);
  border-color: var(--secondary-color-1);
}

.variant-accent {
  background: var(--secondary-color-2);
  border-color: var(--secondary-color-0);
}

.variant-neutral {
  background: var(--primary-color-0);
  border-color: var(--text-color-2);
}

/* Sidebar Item */
.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  min-height: 4.5rem;
  gap: 2px;
  width: 100%;
}

.sidebar-item-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-0);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  flex-shrink: 0;
  margin: 0;
}

.icon {
  font-size: 1.75rem;
  color: var(--secondary-color-0);
  transition: color var(--transition-normal);
}

.sidebar-item-title {
  font-size: 0.65rem;
  font-weight: var(--font-medium);
  color: var(--text-color-1);
  text-align: center;
  line-height: var(--leading-tight);
  transition: color var(--transition-normal);
  word-break: break-word;
  max-width: 95%;
  padding: 0;
  white-space: normal;
  overflow-wrap: break-word;
}

/* Hover Effects */
.sidebar-hover .sidebar-item:hover,
.item-hover:hover {
  transform: translateY(-0.0625rem);
  box-shadow: var(--shadow-md);
  border-color: var(--secondary-color-0);
}

.sidebar-hover .sidebar-item:hover .sidebar-item-icon,
.item-hover:hover .sidebar-item-icon {
  background: var(--secondary-color-0);
  border-color: var(--secondary-color-0);
  transform: scale(1.05);
}

.sidebar-hover .sidebar-item:hover .icon,
.item-hover:hover .icon {
  color: var(--primary-color-0);
}

.sidebar-hover .sidebar-item:hover .sidebar-item-title,
.item-hover:hover .sidebar-item-title {
  color: var(--text-color-0);
}

/* Active State */
.sidebar-item.item-active {
  background: var(--secondary-color-3);
  border-color: var(--secondary-color-3);
}

.sidebar-item.item-active .sidebar-item-icon {
  background: var(--primary-color-0);
  border-color: var(--secondary-color-0);
}

.sidebar-item.item-active .icon {
  color: var(--secondary-color-0);
}

.sidebar-item.item-active .sidebar-item-title {
  color: var(--secondary-color-0);
  font-weight: var(--font-semibold);
}

/* Disabled State */
.sidebar-item.item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.sidebar-item.item-disabled .sidebar-item-icon {
  background: var(--text-color-2);
  border-color: var(--text-color-2);
}

.sidebar-item.item-disabled .icon {
  color: var(--text-color-1);
}

.sidebar-item.item-disabled .sidebar-item-title {
  color: var(--text-color-2);
}

/* Clickable State */
.sidebar-item.item-clickable {
  cursor: pointer;
}

.sidebar-item.item-clickable:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .base-sidebar {
    width: 3.5rem;
    height: 35vh;
    top: 50%;
    transform: translateY(-50%);
    padding: var(--space-sm) 0;
  }
  
  .sidebar-item-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .icon {
    font-size: 1.5rem;
  }
  
  .sidebar-item-title {
    font-size: 0.55rem;
  }
}

@media (max-width: 480px) {
  .base-sidebar {
    width: 3rem;
    height: 30vh;
    top: 50%;
    transform: translateY(-50%);
    padding: var(--space-xs) 0;
  }
  
  .sidebar-item-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .icon {
    font-size: 1.25rem;
  }
  
  .sidebar-item-title {
    font-size: 0.45rem;
  }
}

/* Scrollbar Styling */
.base-sidebar::-webkit-scrollbar {
  width: 0.25rem;
}

.base-sidebar::-webkit-scrollbar-track {
  background: var(--primary-color-2);
  border-radius: var(--border-radius-sm);
}

.base-sidebar::-webkit-scrollbar-thumb {
  background: var(--secondary-color-1);
  border-radius: var(--border-radius-sm);
}

.base-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color-0);
}
</style>
