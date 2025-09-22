<template>
  <div :class="listClasses" :style="listStyles">
    <div v-if="title" class="list-header">
      <h3 class="list-title">{{ title }}</h3>
      <p v-if="subtitle" class="list-subtitle">{{ subtitle }}</p>
    </div>
    
    <ul class="list-container">
      <li 
        v-for="(item, index) in items" 
        :key="getItemKey(item, index)"
        :class="getItemClasses(item, index)"
        @click="handleItemClick(item, index)"
      >
        <div class="list-item-content">
          <!-- Item Icon -->
          <div v-if="item.icon || $slots.icon" class="list-item-icon">
            <slot name="icon" :item="item" :index="index">
              <Icon v-if="item.icon" :icon="item.icon" />
            </slot>
          </div>
          
          <!-- Item Content -->
          <div class="list-item-body">
            <div class="list-item-title">
              <slot name="title" :item="item" :index="index">
                {{ item.title || item.name || item.label }}
              </slot>
            </div>
            <div v-if="item.subtitle || item.description" class="list-item-subtitle">
              <slot name="subtitle" :item="item" :index="index">
                {{ item.subtitle || item.description }}
              </slot>
            </div>
          </div>
          
          <!-- Item Actions -->
          <div v-if="$slots.actions || item.actions" class="list-item-actions">
            <slot name="actions" :item="item" :index="index">
              <BaseButton
                v-for="action in item.actions"
                :key="action.id"
                :variant="(action.variant as any) || 'ghost'"
                :size="(action.size as any) || 'sm'"
                :icon="action.icon"
                @click="handleActionClick(action, item, index)"
              >
                {{ action.label }}
              </BaseButton>
            </slot>
          </div>
        </div>
      </li>
    </ul>
    
    <div v-if="$slots.footer" class="list-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../../composables/useSkinTheme'
import BaseButton from './BaseButton.vue'

interface ListItem {
  id?: string | number
  title?: string
  name?: string
  label?: string
  subtitle?: string
  description?: string
  icon?: string
  disabled?: boolean
  selected?: boolean
  actions?: Array<{
    id: string
    label: string
    icon?: string
    variant?: string
    size?: string
  }>
  [key: string]: any
}

interface Props {
  items: ListItem[]
  title?: string
  subtitle?: string
  variant?: 'default' | 'bordered' | 'striped' | 'hover'
  size?: 'sm' | 'md' | 'lg'
  selectable?: boolean
  clickable?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  selectable: false,
  clickable: false,
  emptyMessage: 'No items to display'
})

const emit = defineEmits<{
  itemClick: [item: ListItem, index: number]
  actionClick: [action: any, item: ListItem, index: number]
}>()

const { getPrimaryColor, getSecondaryColor } = useSkinTheme()

const listClasses = computed(() => [
  'base-list',
  `list-${props.variant}`,
  `list-${props.size}`,
  {
    'list-selectable': props.selectable,
    'list-clickable': props.clickable
  }
])

const listStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2)
}))

const getItemKey = (item: ListItem, index: number) => {
  return item.id || index
}

const getItemClasses = (item: ListItem, index: number) => {
  return [
    'list-item',
    {
      'list-item-disabled': item.disabled,
      'list-item-selected': item.selected,
      'list-item-clickable': props.clickable && !item.disabled
    }
  ]
}

const handleItemClick = (item: ListItem, index: number) => {
  if (!item.disabled && (props.clickable || props.selectable)) {
    emit('itemClick', item, index)
  }
}

const handleActionClick = (action: any, item: ListItem, index: number) => {
  emit('actionClick', action, item, index)
}
</script>

<style scoped>
.base-list {
  background: var(--primary-color-0);
  border-radius: 12px;
  overflow: hidden;
}

.list-header {
  padding: 1rem 1rem 0.5rem;
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  margin-bottom: 0.5rem;
}

.list-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color-2);
  margin: 0 0 0.25rem 0;
}

.list-subtitle {
  font-size: 0.875rem;
  color: var(--secondary-color-1);
  margin: 0;
  opacity: 0.8;
}

.list-container {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list-item {
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  transition: all 0.2s ease;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.list-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--secondary-color-2);
  border-radius: 8px;
  color: var(--secondary-color-0);
  flex-shrink: 0;
}

.list-item-body {
  flex: 1;
  min-width: 0;
}

.list-item-title {
  font-weight: 500;
  color: var(--secondary-color-0);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.list-item-subtitle {
  font-size: 0.75rem;
  color: var(--secondary-color-1);
  opacity: 0.8;
}

.list-item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.list-item-clickable {
  cursor: pointer;
}

.list-item-clickable:hover {
  background: var(--secondary-color-2);
}

.list-item-selected {
  background: var(--secondary-color-2);
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.list-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.list-bordered .list-item {
  border: var(--border-width-thin) solid var(--secondary-color-2);
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.list-bordered .list-item:last-child {
  margin-bottom: 0;
}

.list-striped .list-item:nth-child(even) {
  background: var(--primary-color-1);
}

.list-hover .list-item:hover {
  background: var(--secondary-color-2);
}

/* Sizes */
.list-sm .list-item-content {
  padding: 0.75rem;
  gap: 0.75rem;
}

.list-sm .list-item-icon {
  width: 2rem;
  height: 2rem;
}

.list-sm .list-item-title {
  font-size: 0.8rem;
}

.list-sm .list-item-subtitle {
  font-size: 0.7rem;
}

.list-lg .list-item-content {
  padding: 1.25rem;
  gap: 1.25rem;
}

.list-lg .list-item-icon {
  width: 3rem;
  height: 3rem;
}

.list-lg .list-item-title {
  font-size: 1rem;
}

.list-lg .list-item-subtitle {
  font-size: 0.875rem;
}

.list-footer {
  padding: 1rem;
  border-top: var(--border-width-thin) solid var(--secondary-color-2);
  background: var(--primary-color-1);
}

/* Responsive */
@media (max-width: 768px) {
  .list-item-content {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .list-item-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .list-item-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
