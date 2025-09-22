<template>
  <BaseCard 
    :title="title" 
    :subtitle="subtitle"
    variant="neutral" 
    size="lg"
    class="personal-observatory-card"
  >
    <!-- Time Filter Header -->
    <div class="filter-header">
      <div class="filter-title">
        <Icon :icon="icon" class="filter-icon" />
        <span>{{ title }}</span>
      </div>
      <div class="time-filters">
        <BaseButton
          v-for="filter in timeFilterOptions"
          :key="filter.value"
          :variant="selectedTimeFilter === filter.value ? 'accent' : 'outline'"
          :size="'sm'"
          @click="handleTimeFilterChange(filter.value)"
          class="time-filter-button"
        >
          {{ filter.label }}
        </BaseButton>
      </div>
    </div>

    <!-- Data List -->
    <BaseList
      :items="filteredItems"
      :variant="'default'"
      :size="'md'"
      :empty-message="emptyMessage"
      class="observatory-list"
    >
      <!-- Custom slot for different data types -->
      <template #title="{ item }">
        <div class="item-title">
          <Icon v-if="getItemIcon(item)" :icon="getItemIcon(item)" class="item-icon" />
          <span>{{ getItemTitle(item) }}</span>
          <span v-if="getItemStatus(item)" :class="['item-status', `status-${getItemStatus(item)?.type}`]">
            {{ getItemStatus(item)?.text }}
          </span>
        </div>
      </template>

      <template #subtitle="{ item }">
        <div class="item-subtitle">
          <div class="item-description">{{ getItemDescription(item) }}</div>
          <div class="item-meta">
            <span v-if="getItemReward(item)" class="item-reward">{{ getItemReward(item) }}</span>
            <span v-if="getItemTimestamp(item)" class="item-timestamp">{{ formatTimestamp(getItemTimestamp(item)!) }}</span>
          </div>
        </div>
      </template>

      <template #actions="{ item }">
        <BaseButton
          v-if="showActions"
          size="sm"
          variant="outline"
          @click="handleItemAction(item)"
        >
          View Details
        </BaseButton>
      </template>
    </BaseList>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseButton, BaseList } from '@/components/base'
import { useDesignTokens } from '@/composables/useDesignTokens'

interface TimeFilter {
  value: 'all' | '7d' | '30d'
  label: string
}

interface PersonalObservatoryItem {
  id?: string | number
  [key: string]: any
}

interface Props {
  title: string
  subtitle?: string
  icon: string
  items: PersonalObservatoryItem[]
  dataType: 'quests' | 'foundry' | 'trophies' | 'events' | 'minigames' | 'voting' | 'tokens'
  showActions?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  emptyMessage: 'No data available for the selected time period'
})

const emit = defineEmits<{
  itemAction: [item: PersonalObservatoryItem]
  timeFilterChange: [filter: string]
}>()

const { spacing, typography } = useDesignTokens()

// Time filter options
const timeFilterOptions: TimeFilter[] = [
  { value: 'all', label: 'All' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' }
]

// State
const selectedTimeFilter = ref<'all' | '7d' | '30d'>('all')

// Computed
const filteredItems = computed(() => {
  if (selectedTimeFilter.value === 'all') {
    return props.items
  }

  const now = new Date()
  const filterDate = new Date()
  
  if (selectedTimeFilter.value === '7d') {
    filterDate.setDate(now.getDate() - 7)
  } else if (selectedTimeFilter.value === '30d') {
    filterDate.setDate(now.getDate() - 30)
  }

  return props.items.filter(item => {
    const itemDate = getItemTimestamp(item)
    if (!itemDate) return true // Include items without timestamps
    
    const itemDateTime = new Date(itemDate)
    return itemDateTime >= filterDate
  })
})

// Methods
const handleTimeFilterChange = (filter: 'all' | '7d' | '30d') => {
  selectedTimeFilter.value = filter
  emit('timeFilterChange', filter)
}

const handleItemAction = (item: PersonalObservatoryItem) => {
  emit('itemAction', item)
}

const getItemIcon = (item: PersonalObservatoryItem): string => {
  switch (props.dataType) {
    case 'quests':
      return getQuestIcon(item)
    case 'foundry':
      return getFoundryIcon(item)
    case 'trophies':
      return getTrophyIcon(item)
    case 'events':
      return getEventIcon(item)
    case 'minigames':
      return getMinigameIcon(item)
    case 'voting':
      return getVotingIcon(item)
    case 'tokens':
      return getTokenIcon(item)
    default:
      return 'game-icons:question-mark'
  }
}

const getItemTitle = (item: PersonalObservatoryItem): string => {
  return item.title || item.name || item.label || 'Untitled'
}

const getItemDescription = (item: PersonalObservatoryItem): string => {
  return item.description || item.subtitle || item.type || ''
}

const getItemStatus = (item: PersonalObservatoryItem): { type: string; text: string } | null => {
  switch (props.dataType) {
    case 'quests':
      return item.status ? { type: item.status, text: item.status.replace('_', ' ').toUpperCase() } : null
    case 'foundry':
      return item.status ? { type: item.status, text: item.status.toUpperCase() } : null
    case 'trophies':
      return item.rarity ? { type: item.rarity, text: item.rarity.toUpperCase() } : null
    case 'events':
      return item.result ? { type: item.result === 'victory' ? 'success' : 'info', text: item.result.toUpperCase() } : null
    case 'minigames':
      return item.result ? { type: item.result === 'win' ? 'success' : 'warning', text: item.result.toUpperCase() } : null
    case 'voting':
      return item.vote ? { type: item.vote === 'yes' ? 'success' : 'warning', text: item.vote.toUpperCase() } : null
    case 'tokens':
      return item.action ? { type: item.action, text: item.action.toUpperCase() } : null
    default:
      return null
  }
}

const getItemReward = (item: PersonalObservatoryItem): string | null => {
  return item.reward || item.xpReward ? `${item.xpReward || 0} XP` : null
}

const getItemTimestamp = (item: PersonalObservatoryItem): string | null => {
  return item.timestamp || item.completedAt || item.unlockedAt || item.participatedAt || item.votedAt || null
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}

// Icon getters for different data types
const getQuestIcon = (item: PersonalObservatoryItem): string => {
  if (item.type === 'ingame') return 'game-icons:sword'
  if (item.type === 'guild') return 'game-icons:castle'
  return 'game-icons:scroll'
}

const getFoundryIcon = (item: PersonalObservatoryItem): string => {
  if (item.type === 'token_mint') return 'game-icons:coins'
  if (item.type === 'token_burn') return 'game-icons:fire'
  if (item.type === 'resource_mint') return 'game-icons:gem'
  return 'game-icons:anvil'
}

const getTrophyIcon = (item: PersonalObservatoryItem): string => {
  return 'game-icons:trophy'
}

const getEventIcon = (item: PersonalObservatoryItem): string => {
  if (item.type === 'poker_tournament') return 'game-icons:card-play'
  if (item.type === 'raid') return 'game-icons:sword'
  if (item.type === 'meeting') return 'game-icons:meeting'
  return 'game-icons:calendar'
}

const getMinigameIcon = (item: PersonalObservatoryItem): string => {
  if (item.game === 'Tavern Dice') return 'game-icons:dice'
  if (item.game === 'Poker Tournament') return 'game-icons:card-play'
  if (item.game === 'Golden Token Bonanza') return 'game-icons:coins'
  return 'game-icons:gamepad'
}

const getVotingIcon = (item: PersonalObservatoryItem): string => {
  return 'game-icons:voting'
}

const getTokenIcon = (item: PersonalObservatoryItem): string => {
  if (item.action === 'mint') return 'game-icons:coins'
  if (item.action === 'burn') return 'game-icons:fire'
  if (item.action === 'transfer') return 'game-icons:exchange'
  return 'game-icons:wallet'
}
</script>

<style scoped>
.personal-observatory-card {
  width: 100%;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--secondary-color-0);
}

.filter-icon {
  font-size: 1.25rem;
  color: var(--secondary-color-1);
}

.time-filters {
  display: flex;
  gap: var(--space-sm);
}

.time-filter-button {
  min-width: 60px;
}

.observatory-list {
  margin-top: var(--space-md);
}

.item-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 500;
  color: var(--secondary-color-0);
}

.item-icon {
  font-size: 1rem;
  color: var(--secondary-color-1);
  flex-shrink: 0;
}

.item-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: auto;
}

.status-completed,
.status-success,
.status-yes {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.status-in_progress,
.status-pending,
.status-no {
  background: rgba(251, 191, 36, 0.2);
  color: #d97706;
}

.status-epic,
.status-rare,
.status-uncommon {
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
}

.status-mint,
.status-transfer {
  background: rgba(59, 130, 246, 0.2);
  color: #2563eb;
}

.status-burn {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.status-win {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.status-lose {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.item-subtitle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-description {
  font-size: 0.875rem;
  color: var(--secondary-color-1);
  line-height: 1.4;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.75rem;
  color: var(--secondary-color-2);
}

.item-reward {
  font-weight: 500;
  color: var(--secondary-color-1);
}

.item-timestamp {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .time-filters {
    width: 100%;
    justify-content: space-between;
  }

  .time-filter-button {
    flex: 1;
    min-width: auto;
  }

  .item-title {
    flex-wrap: wrap;
  }

  .item-status {
    margin-left: 0;
    margin-top: 0.25rem;
  }
}
</style>
