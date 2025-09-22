# BaseSummaryObservatory Component

A specialized component for displaying summary statistics, metrics, and analytical data in observatory pages. Designed specifically for dGuild and Financial observatory data that contains aggregated statistics rather than individual items.

## Features

- **Metrics Grid**: Display key performance indicators with icons and values
- **Progress Goals**: Show progress bars for goals and targets
- **Distribution Charts**: Visualize data distribution across categories
- **Recent Activity**: List of recent activities and transactions
- **Time Filtering**: Filter data by All, 7 days, or 30 days
- **Design Token Integration**: Uses the project's design token system
- **Responsive Design**: Adapts to different screen sizes

## Usage

```vue
<template>
  <BaseSummaryObservatory
    title="Guild Overview"
    subtitle="Key guild metrics and member statistics"
    icon="game-icons:castle"
    :key-metrics="guildMetrics"
    :progress-goals="goals"
    :distributions="distributions"
    :recent-activity="activities"
    data-type="guild"
    @time-filter-change="handleTimeFilterChange"
    @metric-click="handleMetricClick"
    @goal-click="handleGoalClick"
    @activity-click="handleActivityClick"
  />
</template>

<script setup>
import { BaseSummaryObservatory } from '@/components/base'

const guildMetrics = [
  {
    id: 'total_members',
    label: 'Total Members',
    value: 87,
    format: 'number',
    icon: 'game-icons:person'
  },
  {
    id: 'guild_level',
    label: 'Guild Level',
    value: 15,
    format: 'number',
    icon: 'game-icons:level-up'
  }
  // ... more metrics
]

const goals = [
  {
    id: 'membership_goal',
    title: 'Membership Growth',
    current: 12,
    target: 20,
    progress: 60,
    format: 'number',
    deadline: '2024-06-01T00:00:00Z'
  }
  // ... more goals
]

const distributions = [
  {
    id: 'role_distribution',
    title: 'Role Distribution',
    items: [
      { key: 'member', label: 'Member', value: 45, percentage: 51.7 },
      { key: 'officer', label: 'Officer', value: 18, percentage: 20.7 }
      // ... more items
    ]
  }
  // ... more distributions
]

const activities = [
  {
    id: 'new_member',
    title: 'New Member Joined',
    description: 'Member capacity increased',
    amount: '+1 member',
    timestamp: '2025-09-22T10:30:00Z',
    status: 'success'
  }
  // ... more activities
]

const handleTimeFilterChange = (filter) => {
  console.log('Time filter changed:', filter)
}

const handleMetricClick = (metric) => {
  console.log('Metric clicked:', metric)
}

const handleGoalClick = (goal) => {
  console.log('Goal clicked:', goal)
}

const handleActivityClick = (activity) => {
  console.log('Activity clicked:', activity)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | **Required.** The title of the observatory section |
| `subtitle` | `string` | - | Optional subtitle for the section |
| `icon` | `string` | - | **Required.** Icon to display in the header (using @iconify/vue format) |
| `keyMetrics` | `Metric[]` | - | **Required.** Array of key metrics to display |
| `progressGoals` | `ProgressGoal[]` | `[]` | Array of progress goals with targets |
| `distributions` | `Distribution[]` | `[]` | Array of distribution charts |
| `recentActivity` | `ActivityItem[]` | `[]` | Array of recent activities |
| `dataType` | `'guild' \| 'financial' \| 'goals' \| 'events' \| 'foundry' \| 'minigame' \| 'voting'` | - | **Required.** Type of data being displayed |

## Data Types

### Metric
```typescript
interface Metric {
  id: string
  label: string
  value: number | string
  format?: 'number' | 'currency' | 'percentage' | 'text'
  icon: string
  change?: {
    type: 'positive' | 'negative' | 'neutral'
    text: string
    icon: string
  }
}
```

### ProgressGoal
```typescript
interface ProgressGoal {
  id: string
  title: string
  current: number
  target: number
  progress: number
  format?: 'number' | 'currency' | 'percentage'
  deadline?: string
}
```

### Distribution
```typescript
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
```

### ActivityItem
```typescript
interface ActivityItem {
  id: string
  title: string
  description: string
  amount?: string
  timestamp?: string
  status?: string
  type?: string
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `time-filter-change` | `string` | Emitted when the time filter changes ('all', '7d', '30d') |
| `metric-click` | `Metric` | Emitted when a metric card is clicked |
| `goal-click` | `ProgressGoal` | Emitted when a progress goal is clicked |
| `activity-click` | `ActivityItem` | Emitted when an activity item is clicked |

## Format Types

The component supports different value formats:

- **`number`**: Displays as a formatted number (e.g., 1,234)
- **`currency`**: Displays with SOL suffix (e.g., 1,234 SOL)
- **`percentage`**: Displays with % suffix (e.g., 85%)
- **`text`**: Displays as plain text

## Data Type Icons

The component automatically assigns appropriate icons based on the `dataType`:

- **`guild`**: `game-icons:castle`
- **`financial`**: `game-icons:coins`
- **`goals`**: `game-icons:target`
- **`events`**: `game-icons:calendar`
- **`foundry`**: `game-icons:anvil`
- **`minigame`**: `game-icons:gamepad`
- **`voting`**: `game-icons:voting`

## Styling

The component uses the project's design token system and includes:

- **Card Layout**: Uses `BaseCard` with neutral variant
- **Metrics Grid**: Responsive grid layout for metric cards
- **Progress Bars**: Animated progress bars for goals
- **Distribution Charts**: Horizontal bar charts for distributions
- **Activity List**: Uses `BaseList` for recent activities
- **Time Filters**: Styled buttons with accent/outline variants
- **Status Indicators**: Color-coded status badges
- **Responsive Design**: Mobile-friendly layout

## Examples

### Guild Overview
```vue
<BaseSummaryObservatory
  title="Guild Overview"
  subtitle="Key guild metrics and member statistics"
  icon="game-icons:castle"
  :key-metrics="[
    {
      id: 'total_members',
      label: 'Total Members',
      value: 87,
      format: 'number',
      icon: 'game-icons:person'
    },
    {
      id: 'guild_level',
      label: 'Guild Level',
      value: 15,
      format: 'number',
      icon: 'game-icons:level-up'
    }
  ]"
  :distributions="[
    {
      id: 'role_distribution',
      title: 'Role Distribution',
      items: [
        { key: 'member', label: 'Member', value: 45, percentage: 51.7 },
        { key: 'officer', label: 'Officer', value: 18, percentage: 20.7 }
      ]
    }
  ]"
  data-type="guild"
/>
```

### Financial Summary
```vue
<BaseSummaryObservatory
  title="Financial Summary"
  subtitle="Guild financial overview and key metrics"
  icon="game-icons:coins"
  :key-metrics="[
    {
      id: 'total_assets',
      label: 'Total Assets',
      value: 4650,
      format: 'currency',
      icon: 'game-icons:treasure-chest'
    },
    {
      id: 'net_worth',
      label: 'Net Worth',
      value: 4400,
      format: 'currency',
      icon: 'game-icons:coins'
    }
  ]"
  :progress-goals="[
    {
      id: 'treasury_goal',
      title: 'Reach 5000 SOL Treasury',
      current: 2500,
      target: 5000,
      progress: 50,
      format: 'currency',
      deadline: '2024-06-01T00:00:00Z'
    }
  ]"
  data-type="financial"
/>
```

## Integration with Observatory Pages

The component is designed to work seamlessly with the existing Observatory structure:

```vue
<template>
  <BaseObservatory>
    <div class="observatory-content">
      <BaseSummaryObservatory
        v-for="section in observatorySections"
        :key="section.id"
        :title="section.title"
        :subtitle="section.subtitle"
        :icon="section.icon"
        :key-metrics="section.metrics"
        :progress-goals="section.goals"
        :distributions="section.distributions"
        :recent-activity="section.activities"
        :data-type="section.dataType"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @goal-click="handleGoalClick"
        @activity-click="handleActivityClick"
      />
    </div>
  </BaseObservatory>
</template>
```

## Best Practices

1. **Use appropriate data types**: Choose the right `dataType` for proper icon assignment
2. **Format values correctly**: Use the appropriate format type for better readability
3. **Provide meaningful labels**: Use clear, descriptive labels for metrics and goals
4. **Include progress context**: For goals, provide realistic targets and current progress
5. **Use consistent icons**: Stick to the @iconify/vue icon set for consistency
6. **Handle empty states**: The component gracefully handles empty arrays
7. **Responsive design**: Test on different screen sizes to ensure proper layout

This component provides a powerful, reusable way to display summary and analytical data across the observatory pages while maintaining design system consistency and providing an excellent user experience.
