<template>
  <div class="achievement-demo">
    <div class="demo-header">
      <h1 class="demo-title">Achievement System Demo</h1>
      <p class="demo-subtitle">Showcasing achievement cards with different levels, progress, and rewards</p>
    </div>

    <div class="demo-controls">
      <div class="filter-controls">
        <BaseButton
          :variant="selectedFilter === 'all' ? 'primary' : 'ghost'"
          @click="setFilter('all')"
        >
          All Achievements
        </BaseButton>
        <BaseButton
          :variant="selectedFilter === 'completed' ? 'primary' : 'ghost'"
          @click="setFilter('completed')"
        >
          Completed
        </BaseButton>
        <BaseButton
          :variant="selectedFilter === 'in-progress' ? 'primary' : 'ghost'"
          @click="setFilter('in-progress')"
        >
          In Progress
        </BaseButton>
      </div>
      
      <div class="level-controls">
        <BaseButton
          :variant="selectedLevel === 'all' ? 'primary' : 'ghost'"
          @click="setLevel('all')"
        >
          All Levels
        </BaseButton>
        <BaseButton
          :variant="selectedLevel === 'Common' ? 'primary' : 'ghost'"
          @click="setLevel('Common')"
        >
          Common
        </BaseButton>
        <BaseButton
          :variant="selectedLevel === 'Epic' ? 'primary' : 'ghost'"
          @click="setLevel('Epic')"
        >
          Epic
        </BaseButton>
        <BaseButton
          :variant="selectedLevel === 'Legendary' ? 'primary' : 'ghost'"
          @click="setLevel('Legendary')"
        >
          Legendary
        </BaseButton>
      </div>
    </div>

    <div class="demo-stats">
      <div class="stat-card">
        <Icon icon="mdi:trophy" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">Completed</span>
        </div>
      </div>
      <div class="stat-card">
        <Icon icon="mdi:star" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ totalPoints }}</span>
          <span class="stat-label">Points Earned</span>
        </div>
      </div>
      <div class="stat-card">
        <Icon icon="mdi:coin" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ totalTokens }}</span>
          <span class="stat-label">Tokens Earned</span>
        </div>
      </div>
      <div class="stat-card">
        <Icon icon="mdi:image" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ mintableCount }}</span>
          <span class="stat-label">Mintable NFTs</span>
        </div>
      </div>
    </div>

    <div class="achievements-grid">
      <BaseAchievementCard
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        :title="achievement.title"
        :description="achievement.description"
        :type="achievement.type"
        :level="achievement.level"
        :icon="achievement.icon"
        :progress-value="achievement.progressValue"
        :progress-max="achievement.progressMax"
        :progress-label="achievement.progressLabel"
        :contribution-points="achievement.contributionPoints"
        :token-reward="achievement.tokenReward"
        :mintable="achievement.mintable"
        :requirement="achievement.requirement"
        :completed="achievement.completed"
        :completed-at="achievement.completedAt"
        :variant="achievement.variant"
        :size="achievement.size"
        :hover="true"
        :clickable="true"
        @click="selectAchievement(achievement)"
      />
    </div>

    <!-- Selected Achievement Details -->
    <div v-if="selectedAchievement" class="selected-achievement">
      <h3>Selected Achievement Details</h3>
      <div class="achievement-details">
        <pre>{{ JSON.stringify(selectedAchievement, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseButton } from '@/components/base'
import BaseAchievementCard from '@/components/base/BaseAchievementCard.vue'

interface Achievement {
  id: string
  title: string
  description: string
  type: string
  level: 'Common' | 'Epic' | 'Legendary'
  icon: string
  progressValue: number
  progressMax: number
  progressLabel: string
  contributionPoints: number
  tokenReward: number
  mintable: boolean
  requirement: string
  completed: boolean
  completedAt?: string
  variant: 'primary' | 'secondary' | 'accent' | 'neutral'
  size: 'sm' | 'md' | 'lg' | 'xl'
}

const selectedFilter = ref('all')
const selectedLevel = ref('all')
const selectedAchievement = ref<Achievement | null>(null)

// Sample achievement data
const achievements = ref<Achievement[]>([
  {
    id: 'game_001',
    title: 'Planet Deliverer',
    description: 'Deliver resources to planets across the galaxy',
    type: 'Game',
    level: 'Common',
    icon: 'mdi:rocket',
    progressValue: 8,
    progressMax: 10,
    progressLabel: 'Resources Delivered',
    contributionPoints: 50,
    tokenReward: 25,
    mintable: false,
    requirement: 'Deliver 10 resources to Planet Alpha',
    completed: false,
    variant: 'primary',
    size: 'md'
  },
  {
    id: 'game_002',
    title: 'Dragon Mountain Raider',
    description: 'Conquer the legendary Dragon Mountain',
    type: 'Game',
    level: 'Epic',
    icon: 'mdi:sword',
    progressValue: 5,
    progressMax: 5,
    progressLabel: 'Raids Completed',
    contributionPoints: 300,
    tokenReward: 150,
    mintable: false,
    requirement: 'Complete 5 successful raids on Dragon Mountain',
    completed: true,
    completedAt: '2024-01-12T11:30:00Z',
    variant: 'primary',
    size: 'md'
  },
  {
    id: 'game_003',
    title: 'Grim Reaper Hunter',
    description: 'Hunt down the fearsome Grim Reapers',
    type: 'Game',
    level: 'Legendary',
    icon: 'mdi:skull',
    progressValue: 85,
    progressMax: 100,
    progressLabel: 'Grim Reapers Slain',
    contributionPoints: 600,
    tokenReward: 300,
    mintable: true,
    requirement: 'Slay 100 Grim Reapers and defeat the Death Lord',
    completed: false,
    variant: 'primary',
    size: 'md'
  },
  {
    id: 'guild_001',
    title: 'Community Builder',
    description: 'Help build and grow the guild community',
    type: 'Guild',
    level: 'Common',
    icon: 'mdi:users',
    progressValue: 3,
    progressMax: 5,
    progressLabel: 'Community Events',
    contributionPoints: 100,
    tokenReward: 50,
    mintable: false,
    requirement: 'Organize 5 community events',
    completed: false,
    variant: 'secondary',
    size: 'md'
  },
  {
    id: 'social_001',
    title: 'Social Butterfly',
    description: 'Be active in guild social channels',
    type: 'Social',
    level: 'Epic',
    icon: 'mdi:chat',
    progressValue: 7,
    progressMax: 7,
    progressLabel: 'Social Milestones',
    contributionPoints: 250,
    tokenReward: 125,
    mintable: false,
    requirement: 'Reach 7 social milestones',
    completed: true,
    completedAt: '2024-01-15T14:20:00Z',
    variant: 'accent',
    size: 'md'
  },
  {
    id: 'trading_001',
    title: 'Market Master',
    description: 'Excel in trading and economic activities',
    type: 'Trading',
    level: 'Legendary',
    icon: 'mdi:shopping-cart',
    progressValue: 0,
    progressMax: 50,
    progressLabel: 'Trading Volume',
    contributionPoints: 1000,
    tokenReward: 500,
    mintable: true,
    requirement: 'Achieve 50,000 trading volume',
    completed: false,
    variant: 'neutral',
    size: 'md'
  },
  {
    id: 'special_001',
    title: 'Founder\'s Legacy',
    description: 'Special achievement for founding members',
    type: 'Special',
    level: 'Legendary',
    icon: 'mdi:star',
    progressValue: 1,
    progressMax: 1,
    progressLabel: 'Founder Status',
    contributionPoints: 2000,
    tokenReward: 1000,
    mintable: true,
    requirement: 'Be a founding member of the guild',
    completed: true,
    completedAt: '2024-01-01T00:00:00Z',
    variant: 'primary',
    size: 'lg'
  }
])

const filteredAchievements = computed(() => {
  let filtered = achievements.value

  // Filter by completion status
  if (selectedFilter.value === 'completed') {
    filtered = filtered.filter(a => a.completed)
  } else if (selectedFilter.value === 'in-progress') {
    filtered = filtered.filter(a => !a.completed && a.progressValue > 0)
  }

  // Filter by level
  if (selectedLevel.value !== 'all') {
    filtered = filtered.filter(a => a.level === selectedLevel.value)
  }

  return filtered
})

const completedCount = computed(() => 
  achievements.value.filter(a => a.completed).length
)

const totalPoints = computed(() => 
  achievements.value
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.contributionPoints, 0)
)

const totalTokens = computed(() => 
  achievements.value
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.tokenReward, 0)
)

const mintableCount = computed(() => 
  achievements.value
    .filter(a => a.completed && a.mintable)
    .length
)

const setFilter = (filter: string) => {
  selectedFilter.value = filter
}

const setLevel = (level: string) => {
  selectedLevel.value = level
}

const selectAchievement = (achievement: Achievement) => {
  selectedAchievement.value = achievement
}
</script>

<style scoped>
.achievement-demo {
  padding: var(--space-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.demo-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.demo-subtitle {
  font-size: var(--text-lg);
  color: var(--text-color-1);
  margin: 0;
  opacity: 0.8;
}

.demo-controls {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.filter-controls,
.level-controls {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.demo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color-1);
}

.stat-icon {
  font-size: 2rem;
  color: var(--secondary-color-0);
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.selected-achievement {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-top: var(--space-xl);
}

.selected-achievement h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-md) 0;
}

.achievement-details {
  background: var(--primary-color-2);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  overflow-x: auto;
}

.achievement-details pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Responsive */
@media (max-width: 768px) {
  .achievement-demo {
    padding: var(--space-md);
  }
  
  .demo-title {
    font-size: var(--text-2xl);
  }
  
  .demo-subtitle {
    font-size: var(--text-base);
  }
  
  .demo-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .filter-controls,
  .level-controls {
    justify-content: center;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: var(--space-sm);
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: var(--text-xl);
  }
}
</style>