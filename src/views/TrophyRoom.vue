<template>
  <div class="trophy-room">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Trophy Room" 
      subtitle="Celebrate achievements and showcase your accomplishments"
      variant="primary" 
      size="lg"
      class="trophy-header-card"
    >
      <div class="trophy-header-content">
        <div class="trophy-description">
          <p>Welcome to the Trophy Room! Here you can view and celebrate all the achievements, awards, and accomplishments earned by guild members. From quest completions to tournament victories, every achievement tells a story of dedication and skill.</p>
        </div>
      </div>
    </BaseCard>

    <!-- Achievement Filter Sidebar -->
    <BaseSidebar
      :items="filterItems"
      variant="primary"
      position="left"
      width="4rem"
      @item-click="handleFilterClick"
    />

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="trophy-main-card"
    >
      <!-- Achievements Grid -->
      <div v-if="filteredAchievements.length > 0" class="achievements-container">
        <div class="achievements-grid">
          <BaseAchievementProgressionCard
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            :achievement="achievement"
            variant="neutral"
            size="md"
            :hover="true"
            :clickable="true"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:trophy" class="empty-icon" />
        <p v-if="allAchievements.length === 0">Loading achievements...</p>
        <p v-else>No achievements match the selected filter</p>
        <p class="empty-subtitle">Try selecting a different category</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseAchievementProgressionCard, BaseSidebar } from '@/components/base'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { getSlpPath } from '@/utils/api'
import { useGuildStore } from '@/stores/guildStore'
import { useMemberStore } from '@/stores/memberStore'
import { useUserStore } from '@/stores/userStore'

// Import theme system
const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

// Stores
const guildStore = useGuildStore()
const memberStore = useMemberStore()

// Achievement data interfaces
interface AchievementCategory {
  id: string
  name: string
  description: string
  file: string
  achievementCount: number
  icon: string
}

interface Achievement {
  id: string
  title: string
  description: string
  type: string
  icon: string
  levels: {
    Common: {
      requirement: string
      contributionPoints: number
      tokenReward: number
      mintable: boolean
      completed: boolean
      completedAt?: string
    }
    Epic: {
      requirement: string
      contributionPoints: number
      tokenReward: number
      mintable: boolean
      completed: boolean
      completedAt?: string
    }
    Legendary: {
      requirement: string
      contributionPoints: number
      tokenReward: number
      mintable: boolean
      completed: boolean
      completedAt?: string
    }
  }
  currentLevel: 'Common' | 'Epic' | 'Legendary'
  totalProgress: number
  maxProgress: number
}

interface MemberAchievementStatus {
  memberID: string
  username: string
  role: string
  achievementStatus: {
    [category: string]: {
      [achievementId: string]: {
        level: 'Common' | 'Epic' | 'Legendary'
        completed: boolean
        completedAt: string | null
      }
    }
  }
  totalCompleted: number
  totalPossible: number
  contributionPointsEarned: number
  tokenRewardsEarned: number
}

// Reactive data
const achievementCategories = ref<AchievementCategory[]>([])
const allAchievements = ref<Achievement[]>([])
const memberAchievementStatus = ref<MemberAchievementStatus | null>(null)
const selectedFilter = ref<string>('all')

// Get current user from member store, with fallback for testing
const currentUser = computed(() => {
  const memberId = memberStore.currentMember?.memberID
  if (memberId) {
    return memberId
  }
  // Fallback for testing - use Alice as default
  console.log('No member loaded, using fallback user')
  return 'g1_alice_prospect'
})

// Filter items for sidebar
const filterItems = computed(() => [
  {
    id: 'all',
    icon: 'game-icons:trophy',
    title: 'All',
    active: selectedFilter.value === 'all'
  },
  ...achievementCategories.value.map(category => ({
    id: category.id,
    icon: category.icon, // Already has game-icons: prefix
    title: category.name,
    active: selectedFilter.value === category.id
  }))
])

// Filtered achievements based on selected filter
const filteredAchievements = computed(() => {
  if (selectedFilter.value === 'all') {
    return allAchievements.value
  }
  return allAchievements.value.filter(achievement => achievement.type.toLowerCase() === selectedFilter.value)
})

// Handle filter click
const handleFilterClick = (item: any) => {
  console.log('Filter clicked:', item)
  selectedFilter.value = item.id
}

// Load achievement categories
const loadAchievementCategories = async () => {
  try {
    const response = await fetch(getSlpPath('Achievements/achievements_index.json'))
    if (!response.ok) {
      console.warn('Failed to load achievement categories')
      return
    }
    
    const data = await response.json()
    achievementCategories.value = data.categories || []
  } catch (error) {
    console.error('Failed to load achievement categories:', error)
  }
}

// Load member achievement status
const loadMemberAchievementStatus = async () => {
  try {
    const currentGuildId = guildStore.guildId
    const currentUserId = currentUser.value
    
    console.log('Loading member achievement status...')
    console.log('Current guild ID:', currentGuildId)
    console.log('Current user ID:', currentUserId)
    console.log('Member store current member:', memberStore.currentMember)
    
    if (!currentGuildId) {
      console.warn('No guild selected')
      return
    }
    
    if (!currentUserId) {
      console.warn('No user selected - member store might not be loaded yet')
      return
    }

    const guildPrefix = currentGuildId === 'guild-1' ? 'g1' : 'g2'
    const url = getSlpPath('Achievements/guild1_achievement_status.json')
    console.log('Fetching achievement status from:', url)
    console.log('Current location:', window.location.href)
    const response = await fetch(url)
    if (!response.ok) {
      console.warn('Failed to load member achievement status:', response.status, response.statusText)
      return
    }
    
    const responseText = await response.text()
    console.log('Raw response:', responseText.substring(0, 200) + '...')
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Loaded achievement status data:', data)
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError)
      console.error('Response was:', responseText)
      return
    }
    
    // Find current user's status
    const userStatus = data.find((member: MemberAchievementStatus) => member.memberID === currentUserId)
    if (userStatus) {
      memberAchievementStatus.value = userStatus
      console.log('Loaded achievement status for user:', currentUserId, userStatus)
    } else {
      console.warn('No achievement status found for user:', currentUserId)
      console.log('Available member IDs:', data.map((m: MemberAchievementStatus) => m.memberID))
    }
  } catch (error) {
    console.error('Failed to load member achievement status:', error)
  }
}

// Load all achievements from category files
const loadAllAchievements = async () => {
  try {
    console.log('Loading all achievements...')
    console.log('Available categories:', achievementCategories.value)
    console.log('Member achievement status:', memberAchievementStatus.value)
    
    const achievements: Achievement[] = []
    
    for (const category of achievementCategories.value) {
      try {
        console.log(`Loading achievements for category: ${category.id}`)
        const response = await fetch(getSlpPath(`Achievements/${category.file}`))
        if (!response.ok) {
          console.warn(`Failed to load ${category.file}`)
          continue
        }
        
        const categoryData = await response.json()
        const categoryAchievements = categoryData.achievements || []
        console.log(`Found ${categoryAchievements.length} achievements in ${category.id}`)
        
        // Map category achievements to our Achievement interface
        for (const achievement of categoryAchievements) {
          const memberStatus = memberAchievementStatus.value?.achievementStatus[category.id]?.[achievement.id]
          const memberLevel = memberStatus?.level || 'Common'
          const memberCompleted = memberStatus?.completed || false
          
          console.log(`Processing achievement ${achievement.id}:`, {
            memberStatus,
            memberLevel,
            memberCompleted
          })
          
          // Create achievement with all levels and current progress
          const achievementData: Achievement = {
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            type: category.name,
            icon: achievement.icon,
            levels: {
              Common: {
                requirement: achievement.levels[0]?.requirement || '',
                contributionPoints: achievement.levels[0]?.contributionPoints || 0,
                tokenReward: achievement.levels[0]?.tokenReward || 0,
                mintable: achievement.levels[0]?.mintable || false,
                completed: memberLevel === 'Common' && memberCompleted,
                completedAt: memberLevel === 'Common' && memberCompleted ? memberStatus?.completedAt || undefined : undefined
              },
              Epic: {
                requirement: achievement.levels[1]?.requirement || '',
                contributionPoints: achievement.levels[1]?.contributionPoints || 0,
                tokenReward: achievement.levels[1]?.tokenReward || 0,
                mintable: achievement.levels[1]?.mintable || false,
                completed: memberLevel === 'Epic' && memberCompleted,
                completedAt: memberLevel === 'Epic' && memberCompleted ? memberStatus?.completedAt || undefined : undefined
              },
              Legendary: {
                requirement: achievement.levels[2]?.requirement || '',
                contributionPoints: achievement.levels[2]?.contributionPoints || 0,
                tokenReward: achievement.levels[2]?.tokenReward || 0,
                mintable: achievement.levels[2]?.mintable || false,
                completed: memberLevel === 'Legendary' && memberCompleted,
                completedAt: memberLevel === 'Legendary' && memberCompleted ? memberStatus?.completedAt || undefined : undefined
              }
            },
            currentLevel: memberLevel,
            totalProgress: memberCompleted ? 3 : (memberLevel === 'Epic' ? 2 : (memberLevel === 'Common' ? 1 : 0)),
            maxProgress: 3
          }
          
          achievements.push(achievementData)
        }
      } catch (error) {
        console.warn(`Failed to load achievements for category ${category.id}:`, error)
      }
    }
    
    allAchievements.value = achievements
    console.log('Loaded total achievements:', achievements.length)
    console.log('Final achievements data:', achievements)
  } catch (error) {
    console.error('Failed to load achievements:', error)
  }
}

// Watch for member changes and reload data
watch(currentUser, async (newUserId) => {
  if (newUserId) {
    console.log('User changed, reloading achievement data for:', newUserId)
    await loadMemberAchievementStatus()
    await loadAllAchievements()
  }
}, { immediate: false })

// Load all data on mount
onMounted(async () => {
  console.log('TrophyRoom mounted - Current user:', currentUser.value)
  console.log('TrophyRoom mounted - Current member:', memberStore.currentMember)
  
  // Load achievement categories first
  await loadAchievementCategories()
  
  // Try to load member profile if not already loaded
  if (!memberStore.currentMember) {
    console.log('No member loaded, attempting to load member profile...')
    const userStore = useUserStore()
    const walletAddress = userStore.selectedWallet?.address
    const guildId = guildStore.guildId
    
    if (walletAddress && guildId) {
      try {
        await memberStore.loadMemberProfile(walletAddress, guildId)
        console.log('Member profile loaded:', memberStore.currentMember)
      } catch (error) {
        console.warn('Failed to load member profile:', error)
      }
    }
  }
  
  // Load member achievement status and achievements
  await loadMemberAchievementStatus()
  await loadAllAchievements()
})
</script>

<style scoped>
.trophy-room {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.trophy-header-card {
  width: 100%;
  max-width: 100%;
}

.trophy-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.trophy-description {
  flex: 1;
}

.trophy-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.trophy-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.achievements-container {
  padding: var(--space-md);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: var(--space-lg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-color-1);
  opacity: 0.6;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  color: var(--secondary-color-0);
}

.empty-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: var(--space-xs);
}

/* Wide screen margin - matching other tavern pages */
@media (min-width: 1400px) {
  .trophy-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .trophy-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .trophy-room {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .trophy-room {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .trophy-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .achievements-container {
    padding: var(--space-sm);
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}

@media (max-width: 480px) {
  .trophy-room {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}
</style>
