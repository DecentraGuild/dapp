<template>
  <div class="gatekeeping">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Gatekeeping" 
      subtitle="Manage guild roles and permissions"
      variant="primary" 
      size="lg"
      class="gatekeeping-header-card"
    >
      <div class="gatekeeping-header-content">
        <div class="gatekeeping-description">
          <p>Control access to guild areas by managing role permissions. Each role has specific access levels to different rooms and features within the guild.</p>
        </div>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="gatekeeping-main-card"
    >
      <div class="roles-container">
        <div 
          v-for="role in roles" 
          :key="role.id"
          class="role-section"
        >
          <!-- Role Card -->
          <BaseCard 
            variant="primary" 
            size="md"
            class="role-card"
          >
            <div class="role-content">
              <!-- Role Emblem -->
              <div class="role-emblem">
                <img 
                  :src="`/SLP/guildpermission/${role.name.toLowerCase()}.svg`"
                  :alt="`${role.name} emblem`"
                  class="emblem-svg"
                />
              </div>
              
              <!-- Role Details -->
              <div class="role-details">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-description">{{ role.description }}</div>
                <div class="role-level">Level {{ role.level }}</div>
                
                <!-- Requirements -->
                <div class="role-requirements">
                  <div class="requirements-title">Requirements:</div>
                  <ul class="requirements-list">
                    <li v-for="requirement in role.requirements" :key="requirement" class="requirement-item">
                      {{ requirement }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Permission Table -->
          <BasePermissionTable
            :rooms="role.rooms"
            :permission-columns="permissionColumns"
            variant="primary"
            size="md"
            class="role-permission-table"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <Icon icon="game-icons:loading" class="loading-icon" />
        <p>Loading roles and permissions...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <Icon icon="game-icons:warning" class="error-icon" />
        <p>{{ error }}</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BaseCard, BasePermissionTable } from '@/components/base'
import { useGuildStore } from '@/stores/guildStore'

interface Role {
  id: string
  name: string
  emblem: string
  color: string
  description: string
  level: number
  requirements: string[]
  rooms: any[]
}

interface PermissionColumn {
  key: string
  label: string
  icon?: string
  required?: boolean
  description?: string
}

const guildStore = useGuildStore()

const roles = ref<Role[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const permissionColumns: PermissionColumn[] = [
  { key: 'view', label: 'View', icon: 'mdi:eye', required: true },
  { key: 'use', label: 'Use', icon: 'mdi:hand-pointing-up' },
  { key: 'manage', label: 'Manage', icon: 'mdi:cog' },
  { key: 'edit', label: 'Edit', icon: 'mdi:pencil' },
  { key: 'all', label: 'All', icon: 'mdi:shield-check', required: true }
]

const loadRoles = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Load the main permission table to get all roles
    const permissionTableResponse = await fetch('/SLP/guildpermission/guild-1_permissiontable.json')
    if (!permissionTableResponse.ok) {
      throw new Error('Failed to load permission table')
    }
    const permissionTable = await permissionTableResponse.json()

    // Load rooms data
    const roomsResponse = await fetch('/SLP/guildpermission/guild-1_rooms.json')
    if (!roomsResponse.ok) {
      throw new Error('Failed to load rooms data')
    }
    const roomsData = await roomsResponse.json()

    // Load each role's individual permissions
    const loadedRoles: Role[] = []
    
    for (const roleData of permissionTable.roles) {
      try {
        // Load the specific role's permission file
        const rolePermissionResponse = await fetch(`/SLP/guildpermission/guild-1_role-${roleData.name.toLowerCase()}.json`)
        if (!rolePermissionResponse.ok) {
          console.warn(`Failed to load permissions for role ${roleData.name}`)
          continue
        }
        
        const rolePermissions = await rolePermissionResponse.json()
        
        // Transform the permissions data to match BasePermissionTable format
        const rooms = roomsData.rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          disabled: false,
          permissions: rolePermissions.permissions[room.id] || {
            view: false,
            use: false,
            manage: false,
            edit: false,
            all: false
          }
        }))

        loadedRoles.push({
          id: roleData.id,
          name: roleData.name,
          emblem: roleData.emblem,
          color: roleData.color,
          description: roleData.description,
          level: roleData.level,
          requirements: roleData.requirements,
          rooms: rooms
        })
      } catch (err) {
        console.warn(`Error loading role ${roleData.name}:`, err)
      }
    }

    // Sort roles by level
    roles.value = loadedRoles.sort((a, b) => a.level - b.level)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load roles'
    console.error('Error loading roles:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.gatekeeping {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.gatekeeping-header-card {
  width: var(--layout-card-width-wide);
  max-width: var(--layout-card-width-wide);
  margin: 0 auto;
}

.gatekeeping-header-content {
  margin-top: var(--space-md);
}

.gatekeeping-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.gatekeeping-main-card {
  width: var(--layout-card-width-wide);
  max-width: var(--layout-card-width-wide);
  margin: 0 auto;
  overflow: hidden;
}

.roles-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.role-section {
  display: flex;
  gap: var(--space-lg);
  align-items: stretch;
}

.role-card {
  width: var(--layout-role-card-width);
  min-width: var(--layout-role-card-min-width);
  flex-shrink: 0;
  border: var(--border-width-thin) solid var(--secondary-color-0);
  display: flex;
  flex-direction: column;
}

.role-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  flex: 1;
  padding: var(--space-md);
  justify-content: space-between;
}

.role-emblem {
  width: var(--component-emblem-size);
  height: var(--component-emblem-size);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.emblem-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.role-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  text-align: center;
}

.role-name {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-xs);
}

.role-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  line-height: 1.5;
  margin-bottom: var(--space-xs);
}

.role-level {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--secondary-color-0);
  background: var(--secondary-color-2);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  display: inline-block;
  margin: 0 auto;
}

.role-requirements {
  margin-top: var(--space-sm);
  text-align: left;
}

.requirements-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-color-1);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-tight);
  margin-bottom: var(--space-xs);
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.requirement-item {
  padding: var(--space-xs) var(--space-sm);
  background: var(--secondary-color-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-color-0);
  position: relative;
  padding-left: var(--space-lg);
}

.requirement-item::before {
  content: "•";
  color: var(--secondary-color-0);
  font-weight: bold;
  position: absolute;
  left: var(--space-sm);
}

.role-permission-table {
  flex: 1;
  min-height: var(--state-height-permission-table);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: var(--state-height-loading);
  color: var(--text-color-1);
  gap: var(--space-md);
}

.loading-icon,
.error-icon {
  width: var(--component-icon-size-md);
  height: var(--component-icon-size-md);
  opacity: 0.6;
}

.loading-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-state {
  color: var(--color-error);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .gatekeeping {
    padding: var(--space-md);
  }
  
  .gatekeeping-header-card,
  .gatekeeping-main-card {
    width: var(--layout-card-width-narrow);
    max-width: var(--layout-card-width-narrow);
  }
}

@media (max-width: 768px) {
  .gatekeeping {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .role-section {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }
  
  .role-card {
    width: 100%;
    min-width: auto;
  }
  
  .role-content {
    flex-direction: row;
    text-align: left;
  }
  
  .role-emblem {
    width: var(--component-emblem-size-mobile);
    height: var(--component-emblem-size-mobile);
    margin: 0;
    flex-shrink: 0;
  }
  
  .emblem-svg {
    width: 100%;
    height: 100%;
  }
  
  .role-details {
    flex: 1;
    text-align: left;
  }
  
  .role-level {
    margin: 0;
    display: inline-block;
  }
}

@media (max-width: 480px) {
  .gatekeeping {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .role-content {
    flex-direction: column;
    text-align: center;
  }
  
  .role-emblem {
    margin: 0 auto;
  }
  
  .role-details {
    text-align: center;
  }
  
  .role-level {
    margin: 0 auto;
  }
}
</style>
