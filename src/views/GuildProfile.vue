<template>
  <div class="guild-profile-page">
    <!-- Primary Guild Card -->
    <BaseCard 
      variant="primary" 
      size="xl" 
      class="guild-primary-card"
    >
      <div class="guild-header">
        <!-- Logo and Basic Info -->
        <div class="guild-info">
          <div class="guild-logo">
            <img 
              :src="guildLogo" 
              :alt="guildName + ' logo'"
              class="logo-image"
            />
          </div>
          <div class="guild-details">
            <h1 class="guild-name">{{ guildName }}</h1>
            <p class="guild-description">{{ guildDescription }}</p>
          </div>
        </div>
      </div>

      <!-- Guild Message -->
      <div class="guild-message">
        <div class="message-content">
          <Icon icon="mdi:message-text" class="message-icon" />
          <p class="message-text">{{ guildMessage }}</p>
        </div>
      </div>

      <!-- Guild Stats Grid -->
      <div class="guild-stats">
        <BaseListGrid
          :items="guildStats"
          :columns="4"
          gap="md"
          size="md"
          variant="secondary"
        />
      </div>
    </BaseCard>

    <!-- Council Members Card -->
    <BaseCard 
      variant="primary" 
      size="lg" 
      class="council-card"
    >
      <template #header>
        <h3 class="card-title">Council Members</h3>
        <p class="card-subtitle">Guild leadership and decision makers</p>
      </template>
      
      <BaseListGrid
        :items="councilMembers"
        :columns="2"
        gap="md"
        size="lg"
        variant="accent"
        hover
      />
    </BaseCard>

    <!-- Members List Card -->
    <BaseCard 
      variant="primary" 
      size="lg" 
      class="members-card"
    >
      <template #header>
        <div class="members-header">
          <div class="members-title">
            <h3 class="card-title">Guild Members</h3>
            <p class="card-subtitle">{{ filteredMembers.length }} of {{ memberCount }} members</p>
          </div>
          <div class="members-filters">
            <BaseDropdown
              v-model="selectedRole"
              :items="roleOptions"
              placeholder="Filter by role"
              size="sm"
            />
          </div>
        </div>
      </template>
      
      <div class="member-list-container">
        <!-- Header -->
        <div class="member-list-header">
          <div class="member-avatar-header"></div>
          <div 
            class="member-name-header clickable-header"
            @click="sortBy('name')"
          >
            Member
            <Icon 
              :icon="sortField === 'name' ? (sortDirection === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down') : 'mdi:chevron-up-down'"
              class="sort-icon"
            />
          </div>
          <div 
            class="member-score-header clickable-header"
            @click="sortBy('score')"
          >
            Score
            <Icon 
              :icon="sortField === 'score' ? (sortDirection === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down') : 'mdi:chevron-up-down'"
              class="sort-icon"
            />
          </div>
          <div 
            class="member-joined-header clickable-header"
            @click="sortBy('joined')"
          >
            Joined
            <Icon 
              :icon="sortField === 'joined' ? (sortDirection === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down') : 'mdi:chevron-up-down'"
              class="sort-icon"
            />
          </div>
          <div class="member-actions-header">Actions</div>
        </div>
        
        <!-- Member Rows -->
        <div class="member-list-rows">
          <div 
            v-for="member in sortedMemberListItems" 
            :key="member.id"
            class="member-row"
            @click="handleMemberClick(member)"
          >
            <div class="member-avatar">
              <img 
                :src="`/SLP/nfts/${member.avatar}`" 
                :alt="member.username"
                class="avatar-image"
              />
            </div>
            
            <div class="member-info">
              <div class="member-name">{{ member.username }}</div>
              <div class="member-role">{{ getRoleDisplayName(member.role) }}</div>
            </div>
            
            <div class="member-score">
              {{ member.contributionScore }}
            </div>
            
            <div class="member-joined">
              {{ formatJoinedDate(member.joinedAt) }}
            </div>
            
            <div class="member-actions">
              <BaseButton
                variant="ghost"
                size="sm"
                icon="mdi:eye"
                @click.stop="handleMemberClick(member)"
              >
                View
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useGuildStore } from '@/stores/guildStore'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseList from '@/components/base/BaseList.vue'
import BaseListGrid from '@/components/base/BaseListGrid.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'

// Role permission data
const rolePermissions = ref<any[]>([])

// Load role permissions from guild permission table
const loadRolePermissions = async (guildId: string) => {
  try {
    console.log('Loading role permissions for guild:', guildId)
    const response = await fetch(`/SLP/guildpermission/${guildId}_permissiontable.json`)
    if (response.ok) {
      const data = await response.json()
      rolePermissions.value = data
      console.log('Loaded role permissions:', data)
    } else {
      console.error('Failed to load role permissions:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Failed to load role permissions:', error)
  }
}

// Get role display name from permission table
const getRoleDisplayName = (roleId: string) => {
  const role = rolePermissions.value.find(r => r.id === roleId)
  console.log('Looking for role:', roleId, 'Found:', role, 'All roles:', rolePermissions.value)
  return role ? role.name : roleId
}

const router = useRouter()
const guildStore = useGuildStore()

// Reactive data
const selectedRole = ref('')
const sortField = ref('name')
const sortDirection = ref('asc')

// Computed properties from store
const guildName = computed(() => guildStore.guildName)
const guildDescription = computed(() => guildStore.guildDescription)
const guildLogo = computed(() => guildStore.guildLogo)
const guildMessage = computed(() => guildStore.guildMessage)
const memberCount = computed(() => guildStore.memberCount)
const guildMembers = computed(() => guildStore.guildMembers)
const getRoleName = computed(() => guildStore.getRoleName)

// Guild stats for the grid
const guildStats = computed(() => [
  {
    id: 'members',
    title: 'Members',
    value: memberCount.value,
    icon: 'mdi:account-group',
    description: 'Total members'
  },
  {
    id: 'created',
    title: 'Created',
    value: 'Jan 2024',
    icon: 'mdi:calendar',
    description: 'Guild founded'
  },
  {
    id: 'quests',
    title: 'Quests',
    value: '24',
    icon: 'mdi:sword-cross',
    description: 'Completed'
  },
  {
    id: 'value',
    title: 'Guild Value',
    value: 'TBD',
    icon: 'mdi:treasure-chest',
    description: 'Total assets'
  }
])

// Council members (founders and council roles)
const councilMembers = computed(() => {
  const council = guildMembers.value.filter(member => 
    member.role.includes('r4') || member.role.includes('r5') // council and founder roles
  )
  
  return council.map(member => ({
    id: member.memberID,
    title: member.username,
    subtitle: getRoleDisplayName(member.role),
    icon: 'mdi:account-crown',
    description: `Joined ${new Date(member.joinedAt).toLocaleDateString()}`
  }))
})

// Filter options
const roleOptions = computed(() => {
  const roles = [...new Set(guildMembers.value.map(m => m.role))]
  return [
    { value: '', label: 'All Roles' },
    ...roles.map(role => ({
      value: role,
      label: getRoleDisplayName(role)
    }))
  ]
})


// Filtered members
const filteredMembers = computed(() => {
  let members = [...guildMembers.value]
  
  // Filter by role
  if (selectedRole.value) {
    members = members.filter(member => member.role === selectedRole.value)
  }
  
  return members
})

// Member list items for table
const memberListItems = computed(() => {
  return filteredMembers.value.map(member => ({
    id: member.memberID,
    username: member.username,
    role: member.role,
    avatar: member.avatar,
    contributionScore: member.contributionScore,
    joinedAt: member.joinedAt,
    walletAddress: member.walletAddress
  }))
})

// Sorted member list items
const sortedMemberListItems = computed(() => {
  const members = [...memberListItems.value]
  
  return members.sort((a, b) => {
    let aValue, bValue
    
    switch (sortField.value) {
      case 'name':
        aValue = a.username.toLowerCase()
        bValue = b.username.toLowerCase()
        break
      case 'score':
        aValue = a.contributionScore
        bValue = b.contributionScore
        break
      case 'joined':
        aValue = new Date(a.joinedAt).getTime()
        bValue = new Date(b.joinedAt).getTime()
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

// Helper functions
const formatJoinedDate = (joinedAt: string) => {
  const date = new Date(joinedAt)
  return date.toLocaleDateString()
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const handleMemberClick = (member: any) => {
  // Navigate to member profile
  router.push(`/member/${member.memberID}`)
}

// Watch for guild changes to load role permissions
watch(() => guildStore.guildId, async (newGuildId) => {
  if (newGuildId) {
    await loadRolePermissions(newGuildId)
  }
}, { immediate: true })

// Load guild data on mount
onMounted(async () => {
  if (!guildStore.hasActiveGuild) {
    // Load available guilds and select the first one
    await guildStore.loadAvailableGuilds()
    if (guildStore.availableGuilds.length > 0) {
      await guildStore.selectGuild(guildStore.availableGuilds[0].id)
    }
  }
})
</script>

<style scoped>
.guild-profile-page {
  max-width: 55%;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Primary Guild Card */
.guild-primary-card {
  width: 100%;
}

.guild-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.guild-info {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  flex: 1;
}

.guild-logo {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.guild-details {
  flex: 1;
  min-width: 0;
}

.guild-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color-0);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.guild-description {
  font-size: 1.125rem;
  color: var(--text-color-1);
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* Guild Message */
.guild-message {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--secondary-color-2);
  border-radius: 12px;
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.message-icon {
  font-size: 1.5rem;
  color: var(--secondary-color-0);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.message-text {
  font-size: 1rem;
  color: var(--text-color-0);
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

/* Guild Stats */
.guild-stats {
  margin-top: 1rem;
}

/* Council Card */
.council-card {
  width: 100%;
}

/* Members Card */
.members-card {
  width: 100%;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.members-title {
  flex: 1;
  min-width: 200px;
}

.members-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Member List Container */
.member-list-container {
  background: var(--primary-color-0);
  border-radius: 12px;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.member-list-header {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 100px;
  gap: 1rem;
  padding: 1rem;
  background: var(--secondary-color-2);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-1);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color-0);
}

.member-list-rows {
  max-height: 400px;
  overflow-y: auto;
}

.member-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-items: center;
}

.member-row:hover {
  background: var(--secondary-color-2);
}

.member-row:last-child {
  border-bottom: none;
}

.clickable-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.clickable-header:hover {
  color: var(--secondary-color-0);
}

.sort-icon {
  font-size: 1rem;
  color: var(--secondary-color-1);
}

/* Member List Items */
.member-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--secondary-color-0);
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.member-name {
  font-weight: 600;
  color: var(--text-color-0);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 0.75rem;
  color: var(--secondary-color-0);
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-score {
  font-size: 0.875rem;
  color: var(--text-color-0);
  font-weight: 600;
  text-align: center;
}

.member-joined {
  font-size: 0.875rem;
  color: var(--text-color-1);
  text-align: center;
}

.member-actions {
  display: flex;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .guild-profile-page {
    max-width: 85%;
  }
}

@media (max-width: 768px) {
  .guild-profile-page {
    max-width: 95%;
    padding: 1rem 0.5rem;
  }
  
  .guild-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .guild-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .guild-logo {
    width: 80px;
    height: 80px;
  }
  
  .guild-name {
    font-size: 1.5rem;
  }
  
  .guild-description {
    font-size: 1rem;
  }
  
  .members-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .members-filters {
    justify-content: center;
  }
  
  .member-list-header {
    grid-template-columns: 50px 1fr 60px 80px 80px;
    gap: 0.5rem;
    padding: 0.75rem;
    font-size: 0.8rem;
  }
  
  .member-row {
    grid-template-columns: 50px 1fr 60px 80px 80px;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .member-avatar {
    width: 2rem;
    height: 2rem;
  }
  
  .member-name {
    font-size: 0.8rem;
  }
  
  .member-role {
    font-size: 0.7rem;
  }
  
  .member-score {
    font-size: 0.8rem;
  }
  
  .member-joined {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .guild-logo {
    width: 60px;
    height: 60px;
  }
  
  .guild-name {
    font-size: 1.25rem;
  }
  
  .members-filters {
    flex-direction: column;
  }
  
  .member-list-header {
    grid-template-columns: 40px 1fr 50px 70px 70px;
    gap: 0.25rem;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .member-row {
    grid-template-columns: 40px 1fr 50px 70px 70px;
    gap: 0.25rem;
    padding: 0.5rem;
  }
  
  .member-avatar {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .member-name {
    font-size: 0.75rem;
  }
  
  .member-role {
    font-size: 0.65rem;
  }
  
  .member-score {
    font-size: 0.75rem;
  }
  
  .member-joined {
    font-size: 0.65rem;
  }
}
</style>