# BasePersonalObservatory Component

A reusable component for displaying personal observatory data with time filtering capabilities.

## Features

- **Time Filtering**: Filter data by All, 7 days, or 30 days
- **Data Type Support**: Handles different data types (quests, foundry, trophies, events, minigames, voting, tokens)
- **Design Token Integration**: Uses the project's design token system for consistent styling
- **Responsive Design**: Adapts to different screen sizes
- **Customizable Icons**: Different icons for different data types
- **Status Indicators**: Visual status indicators for different item states

## Usage

```vue
<template>
  <BasePersonalObservatory
    title="Latest Quests"
    subtitle="Recent quest activity and progress"
    icon="game-icons:scroll"
    :items="questData"
    data-type="quests"
    @item-action="handleQuestAction"
    @time-filter-change="handleTimeFilterChange"
  />
</template>

<script setup>
import { BasePersonalObservatory } from '@/components/base'

const questData = [
  {
    id: "g1_q0001",
    title: "Defeat the Cyber Dragon",
    type: "ingame",
    status: "completed",
    completedAt: "2025-09-21T09:15:00Z",
    reward: "2500 XP + 500 g1-token1 + 100 g1-token2",
    difficulty: "epic"
  }
  // ... more items
]

const handleQuestAction = (item) => {
  console.log('Quest action:', item)
}

const handleTimeFilterChange = (filter) => {
  console.log('Time filter changed:', filter)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | **Required.** The title of the observatory section |
| `subtitle` | `string` | - | Optional subtitle for the section |
| `icon` | `string` | - | **Required.** Icon to display in the header (using @iconify/vue format) |
| `items` | `PersonalObservatoryItem[]` | - | **Required.** Array of items to display |
| `dataType` | `'quests' \| 'foundry' \| 'trophies' \| 'events' \| 'minigames' \| 'voting' \| 'tokens'` | - | **Required.** Type of data being displayed |
| `showActions` | `boolean` | `true` | Whether to show action buttons |
| `emptyMessage` | `string` | `'No data available for the selected time period'` | Message to show when no items are available |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-action` | `PersonalObservatoryItem` | Emitted when an item action button is clicked |
| `time-filter-change` | `string` | Emitted when the time filter changes ('all', '7d', '30d') |

## Data Types

The component supports different data types with specific handling:

### Quests
- **Icon**: `game-icons:scroll` (ingame), `game-icons:castle` (guild)
- **Status**: Shows quest status (completed, in_progress, etc.)
- **Reward**: Displays XP and token rewards

### Foundry Activity
- **Icon**: `game-icons:coins` (mint), `game-icons:fire` (burn), `game-icons:gem` (resource)
- **Status**: Shows transaction status
- **Reward**: Displays costs and refunds

### Trophy Achievements
- **Icon**: `game-icons:trophy`
- **Status**: Shows rarity level (epic, rare, uncommon)
- **Reward**: Displays XP rewards

### Event Participation
- **Icon**: `game-icons:card-play` (poker), `game-icons:sword` (raid), `game-icons:meeting` (meeting)
- **Status**: Shows participation result
- **Reward**: Displays event rewards

### Minigame Activity
- **Icon**: `game-icons:dice` (dice), `game-icons:card-play` (poker), `game-icons:coins` (bonanza)
- **Status**: Shows win/lose result
- **Reward**: Displays game rewards

### Voting Activity
- **Icon**: `game-icons:voting`
- **Status**: Shows vote choice (yes/no)
- **Reward**: Shows proposal status

### Token Activity
- **Icon**: `game-icons:coins` (mint), `game-icons:fire` (burn), `game-icons:exchange` (transfer)
- **Status**: Shows transaction type
- **Reward**: Shows costs and refunds

## Styling

The component uses the project's design token system and automatically adapts to the current theme. It includes:

- **Card Layout**: Uses `BaseCard` with neutral variant
- **List Display**: Uses `BaseList` with default variant
- **Time Filters**: Styled buttons with accent/outline variants
- **Status Indicators**: Color-coded status badges
- **Responsive Design**: Mobile-friendly layout

## Examples

### Complete Implementation

```vue
<template>
  <div class="personal-observatory">
    <!-- Latest Quests -->
    <BasePersonalObservatory
      title="Latest Quests"
      subtitle="Recent quest activity and progress"
      icon="game-icons:scroll"
      :items="personalData.latestQuests"
      data-type="quests"
      @item-action="handleQuestAction"
    />

    <!-- Foundry Activity -->
    <BasePersonalObservatory
      title="Foundry Activity"
      subtitle="Token and resource minting/burning activity"
      icon="game-icons:anvil"
      :items="personalData.foundryActivity"
      data-type="foundry"
      @item-action="handleFoundryAction"
    />

    <!-- Trophy Achievements -->
    <BasePersonalObservatory
      title="Trophy Achievements"
      subtitle="Unlocked achievements and trophies"
      icon="game-icons:trophy"
      :items="personalData.trophyAchievements"
      data-type="trophies"
      @item-action="handleTrophyAction"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BasePersonalObservatory } from '@/components/base'
import personalDataJson from '@/../public/SLP/observatory/g1_personal_alice_prospect.json'

const personalData = ref(personalDataJson)

const handleQuestAction = (item) => {
  // Navigate to quest details or show modal
  console.log('Quest action:', item)
}

const handleFoundryAction = (item) => {
  // Navigate to foundry details or show transaction info
  console.log('Foundry action:', item)
}

const handleTrophyAction = (item) => {
  // Show trophy details or achievement info
  console.log('Trophy action:', item)
}
</script>
```

## Integration with Observatory Pages

The component is designed to work seamlessly with the existing Observatory structure:

```vue
<template>
  <BaseObservatory>
    <div class="observatory-personal-content">
      <BasePersonalObservatory
        v-for="section in observatorySections"
        :key="section.id"
        :title="section.title"
        :subtitle="section.subtitle"
        :icon="section.icon"
        :items="section.items"
        :data-type="section.dataType"
        @item-action="handleItemAction"
      />
    </div>
  </BaseObservatory>
</template>
```

This component provides a consistent, reusable way to display personal observatory data across the application while maintaining the design system's consistency and providing a great user experience.
