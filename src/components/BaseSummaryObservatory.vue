<template>
  <BaseCard 
    :title="title" 
    :subtitle="subtitle"
    variant="neutral" 
    size="lg"
    class="summary-observatory-card"
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

    <!-- Summary Content -->
    <div class="summary-content">
      <!-- Key Metrics Grid -->
      <div v-if="keyMetrics.length > 0" class="metrics-grid">
        <div 
          v-for="metric in keyMetrics" 
          :key="metric.id"
          class="metric-card"
          :class="`metric-${metric.type}`"
        >
          <div class="metric-header">
            <Icon :icon="metric.icon" class="metric-icon" />
            <span class="metric-label">{{ metric.label }}</span>
          </div>
          <div class="metric-value">{{ formatMetricValue(metric.value, metric.format) }}</div>
          <div v-if="metric.change" class="metric-change" :class="`change-${metric.change.type}`">
            <Icon :icon="metric.change.icon" class="change-icon" />
            {{ metric.change.text }}
          </div>
        </div>
      </div>

      <!-- Progress Goals -->
      <div v-if="progressGoals.length > 0" class="goals-section">
        <h3 class="section-title">Goals & Progress</h3>
        <div class="goals-grid">
          <div 
            v-for="goal in progressGoals" 
            :key="goal.id"
            class="goal-card"
          >
            <div class="goal-header">
              <span class="goal-title">{{ goal.title }}</span>
              <span class="goal-progress">{{ goal.progress }}%</span>
            </div>
            <div class="goal-progress-bar">
              <div 
                class="goal-progress-fill" 
                :style="{ width: `${goal.progress}%` }"
              ></div>
            </div>
            <div class="goal-details">
              <span class="goal-current">{{ formatMetricValue(goal.current, goal.format) }}</span>
              <span class="goal-target">/ {{ formatMetricValue(goal.target, goal.format) }}</span>
              <span v-if="goal.deadline" class="goal-deadline">
                Due: {{ formatDate(goal.deadline) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution Charts -->
      <div v-if="distributions.length > 0" class="distributions-section">
        <h3 class="section-title">Distribution</h3>
        <div class="distributions-grid">
          <div 
            v-for="distribution in distributions" 
            :key="distribution.id"
            class="distribution-card"
          >
            <h4 class="distribution-title">{{ distribution.title }}</h4>
            <div class="distribution-items">
              <div 
                v-for="item in distribution.items" 
                :key="item.key"
                class="distribution-item"
              >
                <div class="distribution-label">{{ item.label }}</div>
                <div class="distribution-value">{{ item.value }}</div>
                <div class="distribution-bar">
                  <div 
                    class="distribution-bar-fill" 
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="recentActivity.length > 0" class="activity-section">
        <h3 class="section-title">Recent Activity</h3>
        <BaseList
          :items="recentActivity"
          :variant="'default'"
          :size="'md'"
          class="activity-list"
        >
          <template #title="{ item }">
            <div class="activity-title">
              <Icon :icon="getActivityIcon(item)" class="activity-icon" />
              <span>{{ item.title }}</span>
              <span v-if="item.status" :class="['activity-status', `status-${item.status}`]">
                {{ item.status }}
              </span>
            </div>
          </template>

          <template #subtitle="{ item }">
            <div class="activity-subtitle">
              <div class="activity-description">{{ item.description }}</div>
              <div class="activity-meta">
                <span v-if="item.amount" class="activity-amount">{{ item.amount }}</span>
                <span v-if="item.timestamp" class="activity-timestamp">{{ formatTimestamp(item.timestamp) }}</span>
              </div>
            </div>
          </template>
        </BaseList>
      </div>
    </div>
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

interface Metric {
  id: string
  label: string
  value: number | string
  format?: 'number' | 'currency' | 'percentage' | 'text'
  icon: string
  type?: string
  change?: {
    type: 'positive' | 'negative' | 'neutral'
    text: string
    icon: string
  }
}

interface ProgressGoal {
  id: string
  title: string
  current: number
  target: number
  progress: number
  format?: 'number' | 'currency' | 'percentage'
  deadline?: string
}

interface Distribution {
  id: string
  title: string
  items: Array<{
    key: string
    label: string
    value: number
    percentage: number
  }>
}

interface ActivityItem {
  id?: string | number
  title?: string
  description?: string
  amount?: string
  timestamp?: string
  status?: string
  type?: string
}

interface Props {
  title: string
  subtitle?: string
  icon: string
  keyMetrics: Metric[]
  progressGoals?: ProgressGoal[]
  distributions?: Distribution[]
  recentActivity?: ActivityItem[]
  dataType: 'guild' | 'financial' | 'goals' | 'events' | 'foundry' | 'minigame' | 'voting'
}

const props = withDefaults(defineProps<Props>(), {
  progressGoals: () => [],
  distributions: () => [],
  recentActivity: () => []
})

const emit = defineEmits<{
  timeFilterChange: [filter: string]
  metricClick: [metric: Metric]
  goalClick: [goal: ProgressGoal]
  activityClick: [activity: ActivityItem]
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

// Methods
const handleTimeFilterChange = (filter: 'all' | '7d' | '30d') => {
  selectedTimeFilter.value = filter
  emit('timeFilterChange', filter)
}

const formatMetricValue = (value: number | string, format?: string): string => {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'currency':
      return `${value} SOL`
    case 'percentage':
      return `${value}%`
    case 'number':
      return value.toLocaleString()
    default:
      return value.toString()
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
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

const getActivityIcon = (item: ActivityItem): string => {
  switch (props.dataType) {
    case 'guild':
      return 'game-icons:castle'
    case 'financial':
      return 'game-icons:coins'
    case 'goals':
      return 'game-icons:target'
    case 'events':
      return 'game-icons:calendar'
    case 'foundry':
      return 'game-icons:anvil'
    case 'minigame':
      return 'game-icons:gamepad'
    case 'voting':
      return 'game-icons:voting'
    default:
      return 'game-icons:question-mark'
  }
}
</script>

<style scoped>
.summary-observatory-card {
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

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.metric-card {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 8px;
  padding: var(--space-md);
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: var(--secondary-color-1);
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.metric-icon {
  font-size: 1rem;
  color: var(--secondary-color-1);
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--secondary-color-1);
  font-weight: 500;
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--secondary-color-0);
  margin-bottom: var(--space-xs);
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  font-weight: 500;
}

.change-positive {
  color: #16a34a;
}

.change-negative {
  color: #dc2626;
}

.change-neutral {
  color: var(--secondary-color-1);
}

.change-icon {
  font-size: 0.75rem;
}

/* Goals Section */
.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--secondary-color-0);
  margin-bottom: var(--space-md);
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-md);
}

.goal-card {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 8px;
  padding: var(--space-md);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.goal-title {
  font-weight: 500;
  color: var(--secondary-color-0);
}

.goal-progress {
  font-weight: 600;
  color: var(--secondary-color-1);
}

.goal-progress-bar {
  width: 100%;
  height: 8px;
  background: var(--secondary-color-2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.goal-progress-fill {
  height: 100%;
  background: var(--secondary-color-0);
  transition: width 0.3s ease;
}

.goal-details {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--secondary-color-1);
}

.goal-current {
  font-weight: 600;
  color: var(--secondary-color-0);
}

.goal-deadline {
  margin-left: auto;
  font-size: var(--text-xs);
  opacity: 0.8;
}

/* Distributions Section */
.distributions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
}

.distribution-card {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 8px;
  padding: var(--space-md);
}

.distribution-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--secondary-color-0);
  margin-bottom: var(--space-md);
}

.distribution-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.distribution-label {
  font-size: var(--text-sm);
  color: var(--secondary-color-1);
}

.distribution-value {
  font-weight: 600;
  color: var(--secondary-color-0);
}

.distribution-bar {
  width: 100%;
  height: 4px;
  background: var(--secondary-color-2);
  border-radius: 2px;
  overflow: hidden;
}

.distribution-bar-fill {
  height: 100%;
  background: var(--secondary-color-0);
  transition: width 0.3s ease;
}

/* Activity Section */
.activity-list {
  margin-top: var(--space-md);
}

.activity-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 500;
  color: var(--secondary-color-0);
}

.activity-icon {
  font-size: 1rem;
  color: var(--secondary-color-1);
}

.activity-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: auto;
}

.status-completed,
.status-success {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.status-pending,
.status-in-progress {
  background: rgba(251, 191, 36, 0.2);
  color: #d97706;
}

.activity-subtitle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-description {
  font-size: var(--text-sm);
  color: var(--secondary-color-1);
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-xs);
  color: var(--secondary-color-2);
}

.activity-amount {
  font-weight: 500;
  color: var(--secondary-color-1);
}

.activity-timestamp {
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

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .goals-grid,
  .distributions-grid {
    grid-template-columns: 1fr;
  }

  .activity-title {
    flex-wrap: wrap;
  }

  .activity-status {
    margin-left: 0;
    margin-top: 0.25rem;
  }
}
</style>
