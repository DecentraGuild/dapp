<template>
  <div 
    :class="gridClasses"
    :style="gridStyles"
  >
    <div 
      v-for="(item, index) in items" 
      :key="item.id || index"
      :class="itemClasses"
      :style="itemStyles"
      @click="handleItemClick(item, index)"
    >
      <!-- Icon or Image -->
      <div v-if="item.icon" class="grid-item-icon" :class="{ large: props.largeIcons }">
        <img 
          v-if="isImageUrl(item.icon)" 
          :src="item.icon" 
          :alt="item.title"
          class="icon-image"
        />
        <Icon v-else :icon="item.icon" class="icon" />
      </div>
      
      <!-- Content -->
      <div class="grid-item-content">
        <div v-if="item.title" class="grid-item-title">{{ item.title }}</div>
        <div v-if="item.subtitle" class="grid-item-subtitle">{{ item.subtitle }}</div>
        <div v-if="item.value" class="grid-item-value">{{ item.value }}</div>
        <div v-if="item.description" class="grid-item-description">{{ item.description }}</div>
      </div>
      
      <!-- Status/Action -->
      <div v-if="item.status || item.action" class="grid-item-status">
        <div v-if="item.status" class="status-indicator" :class="item.status"></div>
        <div v-if="item.action" class="action-button" @click="handleAction(item)">
          <Icon :icon="item.actionIcon || 'mdi:chevron-right'" class="action-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '@/composables/useSkinTheme'

interface GridItem {
  id?: string
  icon?: string
  title?: string
  subtitle?: string
  value?: string | number
  description?: string
  status?: 'active' | 'inactive' | 'pending' | 'error'
  action?: () => void
  actionIcon?: string
}

interface Props {
  items: GridItem[]
  columns?: number
  gap?: 'sm' | 'md' | 'lg'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  hover?: boolean
  clickable?: boolean
  largeIcons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 2,
  gap: 'md',
  size: 'md',
  variant: 'primary',
  hover: false,
  clickable: false,
  largeIcons: false
})

const emit = defineEmits<{
  itemClick: [item: GridItem, index: number]
}>()

const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

const gridClasses = computed(() => [
  'base-list-grid',
  `grid-cols-${props.columns}`,
  `gap-${props.gap}`,
  `size-${props.size}`,
  `variant-${props.variant}`,
  {
    'grid-hover': props.hover,
    'grid-clickable': props.clickable
  }
])

const itemClasses = computed(() => [
  'grid-item',
  `item-${props.size}`,
  {
    'item-hover': props.hover,
    'item-clickable': props.clickable,
    'large-icons': props.largeIcons
  }
])

const gridStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2),
  '--border-radius-sm': getBorderRadius('sm'),
  '--border-radius-md': getBorderRadius('md'),
  '--border-radius-lg': getBorderRadius('lg'),
  '--border-radius-xl': getBorderRadius('xl')
}))

const itemStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2),
  '--border-radius-sm': getBorderRadius('sm'),
  '--border-radius-md': getBorderRadius('md'),
  '--border-radius-lg': getBorderRadius('lg'),
  '--border-radius-xl': getBorderRadius('xl')
}))

const handleAction = (item: GridItem) => {
  if (item.action) {
    item.action()
  }
}

const handleItemClick = (item: GridItem, index: number) => {
  if (props.clickable) {
    emit('itemClick', item, index)
  }
}

const isImageUrl = (url: string): boolean => {
  return url.includes('.') && (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg') || url.includes('.webp'))
}
</script>

<style scoped>
.base-list-grid {
  display: grid;
  width: 100%;
}

/* Grid Columns */
.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Gaps */
.gap-sm { gap: 0.5rem; }
.gap-md { gap: 0.75rem; }
.gap-lg { gap: 1rem; }

/* Sizes */
.size-sm .grid-item { padding: 0.5rem; }
.size-md .grid-item { padding: 0.625rem; }
.size-lg .grid-item { padding: 0.75rem; }

/* Variants */
.variant-primary .grid-item {
  background: var(--primary-color-1);
  border: var(--component-border-width) solid var(--secondary-color-2);
}

.variant-secondary .grid-item {
  background: var(--primary-color-2);
  border: var(--component-border-width) solid var(--secondary-color-1);
}

.variant-accent .grid-item {
  background: var(--secondary-color-2);
  border: var(--component-border-width) solid var(--secondary-color-0);
}

.variant-neutral .grid-item {
  background: var(--primary-color-0);
  border: var(--component-border-width) solid var(--text-color-2);
}

/* Grid Item */
.grid-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

/* Large Icon Grid Item */
.grid-item.large-icons {
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-md);
  min-height: auto;
}

.grid-hover .grid-item:hover,
.item-hover:hover {
  transform: translateY(-0.0625rem);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color-0);
}

.grid-clickable .grid-item,
.item-clickable {
  cursor: pointer;
}

.grid-clickable .grid-item:hover,
.item-clickable:hover {
  transform: translateY(-0.0625rem);
  box-shadow: var(--shadow-lg);
}

/* Icon */
.grid-item-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-1);
  border-radius: var(--border-radius-sm);
  border: var(--component-border-width) solid var(--secondary-color-2);
}

/* Large Icon for NFT Grid */
.grid-item-icon.large {
  width: 100%;
  max-width: 12.5rem;
  height: 12.5rem;
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  margin: var(--space-md) auto 0 auto;
  overflow: hidden;
}

.icon {
  font-size: 0.875rem;
  color: var(--secondary-color-0);
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

/* Content */
.grid-item-content {
  flex: 1;
  min-width: 0;
}

.grid-item-title {
  font-weight: 600;
  color: var(--text-color-0);
  font-size: 0.8rem;
  margin-bottom: 0.125rem;
  line-height: 1.2;
}

.grid-item-subtitle {
  font-size: 0.7rem;
  color: var(--secondary-color-0);
  font-weight: 500;
  margin-bottom: 0.125rem;
  line-height: 1.2;
}

.grid-item-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-color-0);
  line-height: 1;
}

.grid-item-description {
  font-size: 0.7rem;
  color: var(--text-color-1);
  margin-top: 0.125rem;
  line-height: 1.2;
}

/* Status */
.grid-item-status {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  flex-shrink: 0;
}

.status-indicator {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background: var(--text-color-2);
}

.status-indicator.active {
  background: var(--secondary-color-0);
}

.status-indicator.inactive {
  background: var(--text-color-2);
}

.status-indicator.pending {
  background: var(--secondary-color-1);
}

.status-indicator.error {
  background: var(--theme-emergency);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--border-radius-sm);
  background: var(--primary-color-0);
  border: var(--component-border-width) solid var(--secondary-color-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--secondary-color-0);
  border-color: var(--secondary-color-0);
}

.action-icon {
  font-size: 0.75rem;
  color: var(--text-color-1);
  transition: color 0.2s ease;
}

.action-button:hover .action-icon {
  color: var(--primary-color-0);
}

/* Responsive */
@media (max-width: 1200px) {
  .grid-item-icon.large {
    max-width: 10rem;
    height: 10rem;
  }
}

@media (max-width: 768px) {
  .grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-4 { grid-template-columns: repeat(3, 1fr); }
  
  .grid-item-icon.large {
    max-width: 8rem;
    height: 8rem;
  }
}

@media (max-width: 480px) {
  .grid-cols-2 { grid-template-columns: 1fr; }
  .grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
  
  .grid-item-icon.large {
    max-width: 6rem;
    height: 6rem;
  }
}

@media (max-width: 360px) {
  .grid-cols-2 { grid-template-columns: 1fr; }
  .grid-cols-3 { grid-template-columns: 1fr; }
  .grid-cols-4 { grid-template-columns: 1fr; }
  
  .grid-item-icon.large {
    max-width: 6rem;
    height: 6rem;
  }
}
</style>
