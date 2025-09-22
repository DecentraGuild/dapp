<template>
  <BaseCard 
    :variant="variant"
    :size="size"
    class="permission-table-card"
  >
    <div class="permission-table-container">
      <!-- Table Header -->
      <div class="permission-table-header">
        <div class="room-column-header">
          <span class="header-text">Room</span>
        </div>
        <div class="permission-columns">
          <div 
            v-for="permission in permissionColumns" 
            :key="permission.key"
            class="permission-column-header"
          >
            <span class="header-text">{{ permission.label }}</span>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="permission-table-body">
        <div 
          v-for="room in rooms" 
          :key="room.id"
          class="permission-row"
          :class="{ 'permission-row-disabled': room.disabled }"
        >
          <!-- Room Name -->
          <div class="room-cell">
            <span class="room-name">{{ room.name }}</span>
          </div>

          <!-- Permission Cells -->
          <div class="permission-cells">
            <div 
              v-for="permission in permissionColumns" 
              :key="permission.key"
              class="permission-cell"
              :class="getPermissionCellClass(room, permission.key)"
            >
              <BaseButton
                v-if="editable"
                :variant="getPermissionButtonVariant(room, permission.key)"
                :size="'xs'"
                :icon="getPermissionIcon(room, permission.key)"
                @click="togglePermission(room, permission.key)"
                class="permission-toggle"
              />
              <div v-else class="permission-display">
                <Icon 
                  :icon="getPermissionIcon(room, permission.key)"
                  class="permission-status-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../../composables/useSkinTheme'
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'

export interface PermissionColumn {
  key: string
  label: string
  icon?: string
  required?: boolean
  description?: string
}

export interface Room {
  id: string
  name: string
  description?: string
  icon?: string
  disabled?: boolean
  permissions: Record<string, boolean>
}

interface Props {
  rooms: Room[]
  permissionColumns?: PermissionColumn[]
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  showSummary?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  permissionColumns: () => [
    { key: 'view', label: 'View', icon: 'mdi:eye', required: true },
    { key: 'use', label: 'Use', icon: 'mdi:hand-pointing-up' },
    { key: 'manage', label: 'Manage', icon: 'mdi:cog' },
    { key: 'edit', label: 'Edit', icon: 'mdi:pencil' },
    { key: 'all', label: 'All', icon: 'mdi:shield-check', required: true }
  ],
  variant: 'primary',
  size: 'md',
  editable: false,
  showSummary: true
})

const emit = defineEmits<{
  permissionChange: [room: Room, permission: string, value: boolean]
  roomClick: [room: Room]
}>()

const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

const totalActivePermissions = computed(() => {
  return props.rooms.reduce((total, room) => {
    return total + Object.values(room.permissions).filter(Boolean).length
  }, 0)
})

const getPermissionCellClass = (room: Room, permissionKey: string) => {
  const hasPermission = room.permissions[permissionKey]
  const column = props.permissionColumns.find(col => col.key === permissionKey)
  
  return {
    'permission-granted': hasPermission,
    'permission-denied': !hasPermission,
    'permission-required': column?.required,
    'permission-disabled': room.disabled
  }
}

const getPermissionButtonVariant = (room: Room, permissionKey: string) => {
  const hasPermission = room.permissions[permissionKey]
  const column = props.permissionColumns.find(col => col.key === permissionKey)
  
  if (room.disabled) return 'ghost'
  if (hasPermission) return 'primary'
  if (column?.required) return 'secondary'
  return 'ghost'
}

const getPermissionIcon = (room: Room, permissionKey: string) => {
  const hasPermission = room.permissions[permissionKey]
  
  if (room.disabled) return 'mdi:lock'
  if (hasPermission) return 'mdi:check'
  return 'mdi:close'
}

const getPermissionLabel = (room: Room, permissionKey: string) => {
  const hasPermission = room.permissions[permissionKey]
  
  if (room.disabled) return 'Locked'
  if (hasPermission) return 'Yes'
  return 'No'
}

const togglePermission = (room: Room, permissionKey: string) => {
  if (room.disabled) return
  
  const newValue = !room.permissions[permissionKey]
  room.permissions[permissionKey] = newValue
  
  emit('permissionChange', room, permissionKey, newValue)
}
</script>

<style scoped>
.permission-table-card {
  overflow: hidden;
}

.permission-table-container {
  display: flex;
  flex-direction: column;
}

.permission-table-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--primary-color-1);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  font-weight: var(--font-medium);
}

.room-column-header {
  display: flex;
  align-items: center;
  padding: var(--space-xs);
}

.permission-columns {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-xs);
}

.permission-column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs);
  text-align: center;
  font-size: var(--text-xs);
}

.header-text {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-color-0);
}

.permission-table-body {
  display: flex;
  flex-direction: column;
}

.permission-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-xs);
  padding: var(--space-xs);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  min-height: 32px;
}

.permission-row-disabled {
  opacity: 0.5;
}

.room-cell {
  display: flex;
  align-items: center;
  padding: var(--space-xs);
}

.room-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-color-0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.permission-cells {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-xs);
}

.permission-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs);
  transition: all var(--transition-fast);
  min-height: 24px;
}

.permission-granted {
  background: var(--secondary-color-2);
  border-radius: var(--radius-sm);
}

.permission-denied {
  background: var(--primary-color-2);
  border-radius: var(--radius-sm);
}

.permission-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.permission-toggle {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  padding: 0;
  border-radius: var(--radius-sm);
}

.permission-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.permission-status-icon {
  font-size: 14px;
  color: var(--secondary-color-0);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .permission-table-header,
  .permission-row {
    grid-template-columns: 120px 1fr;
  }
  
  .permission-columns,
  .permission-cells {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .permission-column-header {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    height: 60px;
    justify-content: center;
  }
  
  .header-text {
    font-size: var(--text-xs);
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .permission-table-header,
  .permission-row {
    grid-template-columns: 100px 1fr;
  }
  
  .permission-columns,
  .permission-cells {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .permission-column-header {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    height: 50px;
    justify-content: center;
  }
  
  .room-name {
    font-size: var(--text-xs);
  }
  
  .header-text {
    font-size: var(--text-xs);
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .permission-table-header,
  .permission-row {
    grid-template-columns: 80px 1fr;
  }
  
  .permission-columns,
  .permission-cells {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .permission-column-header {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    height: 40px;
    justify-content: center;
  }
  
  .header-text {
    font-size: 10px;
    white-space: nowrap;
  }
}
</style>
