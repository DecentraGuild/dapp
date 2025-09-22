<template>
  <div class="base-dropdown" :class="dropdownClasses" :style="dropdownStyles">
    <!-- Trigger Button -->
    <button
      ref="triggerRef"
      :class="triggerClasses"
      :disabled="disabled"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <Icon v-if="triggerIcon" :icon="triggerIcon" class="trigger-icon" />
      <span v-if="selectedItem" class="selected-text">
        <slot name="selected" :item="selectedItem">
          {{ selectedItem.title || selectedItem.name || selectedItem.label }}
        </slot>
      </span>
      <span v-else class="placeholder-text">{{ placeholder }}</span>
      <Icon 
        :icon="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
        class="dropdown-icon"
        :class="{ 'rotated': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="dropdown-menu"
        :class="menuClasses"
        :style="menuStyles"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="dropdown-search">
          <BaseInput
            v-model="searchQuery"
            placeholder="Search..."
            size="sm"
            prefix-icon="mdi:magnify"
            @input="(event: Event) => handleSearch((event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Menu Items -->
        <div class="dropdown-content">
          <div v-if="filteredItems.length === 0" class="dropdown-empty">
            <Icon icon="mdi:inbox-outline" class="empty-icon" />
            <span>{{ emptyMessage }}</span>
          </div>

          <button
            v-for="(item, index) in filteredItems"
            :key="getItemKey(item, index)"
            :class="getItemClasses(item, index)"
            :disabled="item.disabled"
            @click="selectItem(item, index)"
            @mouseenter="hoveredIndex = index"
          >
            <div class="item-content">
              <!-- Item Icon -->
              <div v-if="item.icon || $slots.icon" class="item-icon">
                <slot name="icon" :item="item" :index="index">
                  <Icon v-if="item.icon" :icon="item.icon" />
                </slot>
              </div>

              <!-- Item Text -->
              <div class="item-text">
                <div class="item-title">
                  <slot name="title" :item="item" :index="index">
                    {{ item.title || item.name || item.label }}
                  </slot>
                </div>
                <div v-if="item.subtitle || item.description" class="item-subtitle">
                  <slot name="subtitle" :item="item" :index="index">
                    {{ item.subtitle || item.description }}
                  </slot>
                </div>
              </div>

              <!-- Item Badge -->
              <div v-if="item.badge || $slots.badge" class="item-badge">
                <slot name="badge" :item="item" :index="index">
                  <span v-if="item.badge" class="badge">{{ item.badge }}</span>
                </slot>
              </div>

              <!-- Checkmark for selected item -->
              <Icon 
                v-if="isItemSelected(item)" 
                icon="mdi:check" 
                class="check-icon"
              />
            </div>
          </button>
        </div>

        <!-- Footer Actions -->
        <div v-if="$slots.footer" class="dropdown-footer">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../../composables/useSkinTheme'
import BaseInput from './BaseInput.vue'

interface DropdownItem {
  id?: string | number
  title?: string
  name?: string
  label?: string
  subtitle?: string
  description?: string
  icon?: string
  badge?: string
  disabled?: boolean
  value?: any
  [key: string]: any
}

interface Props {
  items: DropdownItem[]
  modelValue?: DropdownItem | string | number
  placeholder?: string
  triggerIcon?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  emptyMessage?: string
  maxHeight?: string
  align?: 'left' | 'right' | 'center'
  position?: 'bottom' | 'top' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  variant: 'default',
  size: 'md',
  disabled: false,
  searchable: false,
  clearable: false,
  multiple: false,
  emptyMessage: 'No options available',
  maxHeight: '300px',
  align: 'left',
  position: 'bottom'
})

const emit = defineEmits<{
  'update:modelValue': [value: DropdownItem | DropdownItem[] | null]
  change: [value: DropdownItem | DropdownItem[] | null]
  search: [query: string]
  open: []
  close: []
}>()

const { getPrimaryColor, getSecondaryColor } = useSkinTheme()

// Refs
const triggerRef = ref<HTMLButtonElement>()
const menuRef = ref<HTMLDivElement>()
const isOpen = ref(false)
const searchQuery = ref('')
const hoveredIndex = ref(-1)

// Computed
const selectedItem = computed(() => {
  if (!props.modelValue) return null
  
  if (typeof props.modelValue === 'object') {
    return props.modelValue
  }
  
  return props.items.find(item => 
    item.id === props.modelValue || 
    item.value === props.modelValue
  ) || null
})

const filteredItems = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.items
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item => {
    const title = (item.title || item.name || item.label || '').toLowerCase()
    const subtitle = (item.subtitle || item.description || '').toLowerCase()
    return title.includes(query) || subtitle.includes(query)
  })
})

const dropdownClasses = computed(() => [
  'base-dropdown',
  `dropdown-${props.variant}`,
  `dropdown-${props.size}`,
  {
    'dropdown-disabled': props.disabled,
    'dropdown-open': isOpen.value
  }
])

const triggerClasses = computed(() => [
  'dropdown-trigger',
  `trigger-${props.variant}`,
  `trigger-${props.size}`,
  {
    'trigger-disabled': props.disabled,
    'trigger-open': isOpen.value
  }
])

const menuClasses = computed(() => [
  'dropdown-menu',
  `menu-${props.align}`,
  `menu-${props.position}`
])

const dropdownStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2)
}))

const menuStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--max-height': props.maxHeight
}))

// Methods
const getItemKey = (item: DropdownItem, index: number) => {
  return item.id || index
}

const getItemClasses = (item: DropdownItem, index: number) => [
  'dropdown-item',
  {
    'item-disabled': item.disabled,
    'item-selected': isItemSelected(item),
    'item-hovered': hoveredIndex.value === index
  }
]

const isItemSelected = (item: DropdownItem) => {
  if (!selectedItem.value) return false
  return selectedItem.value.id === item.id || selectedItem.value === item
}

const toggleDropdown = () => {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = () => {
  isOpen.value = true
  emit('open')
  nextTick(() => {
    focusFirstItem()
  })
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  hoveredIndex.value = -1
  emit('close')
}

const selectItem = (item: DropdownItem, index: number) => {
  if (item.disabled) return
  
  emit('update:modelValue', item)
  emit('change', item)
  closeDropdown()
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  emit('search', query)
  hoveredIndex.value = -1
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      openDropdown()
    }
    return
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      triggerRef.value?.focus()
      break
    case 'ArrowDown':
      event.preventDefault()
      navigateItems(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      navigateItems(-1)
      break
    case 'Enter':
      event.preventDefault()
      if (hoveredIndex.value >= 0 && hoveredIndex.value < filteredItems.value.length) {
        selectItem(filteredItems.value[hoveredIndex.value], hoveredIndex.value)
      }
      break
  }
}

const navigateItems = (direction: number) => {
  const items = filteredItems.value
  if (items.length === 0) return

  let newIndex = hoveredIndex.value + direction
  
  if (newIndex < 0) {
    newIndex = items.length - 1
  } else if (newIndex >= items.length) {
    newIndex = 0
  }

  hoveredIndex.value = newIndex
}

const focusFirstItem = () => {
  const firstItem = menuRef.value?.querySelector('.dropdown-item:not(.item-disabled)') as HTMLElement
  if (firstItem) {
    firstItem.focus()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!triggerRef.value?.contains(event.target as Node) && 
      !menuRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.base-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 8px;
  color: var(--secondary-color-0);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-trigger:hover:not(.trigger-disabled) {
  border-color: var(--secondary-color-1);
  background: var(--primary-color-1);
}

.dropdown-trigger:focus {
  outline: 2px solid var(--secondary-color-0);
  outline-offset: 2px;
}

.dropdown-trigger.trigger-open {
  border-color: var(--secondary-color-0);
  box-shadow: 0 0 0 3px var(--secondary-color-2);
}

.trigger-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trigger-icon {
  font-size: 1.125rem;
  color: var(--secondary-color-1);
  flex-shrink: 0;
}

.selected-text {
  flex: 1;
  color: var(--secondary-color-0);
}

.placeholder-text {
  flex: 1;
  color: var(--secondary-color-1);
  opacity: 0.7;
}

.dropdown-icon {
  font-size: 1rem;
  color: var(--secondary-color-1);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-0);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.25rem;
  overflow: hidden;
  max-height: var(--max-height);
}

.menu-right {
  left: auto;
  right: 0;
}

.menu-center {
  left: 50%;
  transform: translateX(-50%);
}

.menu-top {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 0.25rem;
}

.dropdown-search {
  padding: 0.75rem;
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.dropdown-content {
  max-height: calc(var(--max-height) - 4rem);
  overflow-y: auto;
}

.dropdown-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--secondary-color-1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.dropdown-item {
  width: 100%;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover:not(.item-disabled) {
  background: var(--secondary-color-2);
}

.dropdown-item.item-selected {
  background: var(--secondary-color-2);
}

.dropdown-item.item-hovered {
  background: var(--secondary-color-2);
}

.dropdown-item.item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--secondary-color-1);
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  color: var(--secondary-color-0);
  font-size: 0.875rem;
}

.item-subtitle {
  font-size: 0.75rem;
  color: var(--secondary-color-1);
  opacity: 0.8;
  margin-top: 0.125rem;
}

.item-badge {
  flex-shrink: 0;
}

.badge {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.check-icon {
  font-size: 1rem;
  color: var(--secondary-color-0);
  flex-shrink: 0;
}

.dropdown-footer {
  padding: 0.75rem;
  border-top: var(--border-width-thin) solid var(--secondary-color-2);
  background: var(--primary-color-1);
}

/* Variants */
.dropdown-filled .dropdown-trigger {
  background: var(--primary-color-1);
  border-color: transparent;
}

.dropdown-outlined .dropdown-trigger {
  background: transparent;
  border-width: var(--border-width-thin);
}

/* Sizes */
.dropdown-sm .dropdown-trigger {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.dropdown-md .dropdown-trigger {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.dropdown-lg .dropdown-trigger {
  padding: 1rem 1.25rem;
  font-size: 1rem;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 768px) {
  .dropdown-menu {
    position: fixed;
    top: auto;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-height: 50vh;
  }
  
  .menu-top .dropdown-menu {
    top: 1rem;
    bottom: auto;
  }
}
</style>
