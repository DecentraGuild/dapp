<template>
  <div class="personal-observatory-demo">
    <div class="demo-header">
      <h1>Personal Observatory Demo</h1>
      <p>Demonstration of BasePersonalObservatory component with Alice's data</p>
    </div>

    <!-- Latest Quests -->
    <BasePersonalObservatory
      title="Latest Quests"
      subtitle="Recent quest activity and progress"
      icon="game-icons:scroll"
      :items="personalData.latestQuests"
      data-type="quests"
      @item-action="handleQuestAction"
      @time-filter-change="handleTimeFilterChange"
    />

    <!-- Foundry Activity -->
    <BasePersonalObservatory
      title="Foundry Activity"
      subtitle="Token and resource minting/burning activity"
      icon="game-icons:anvil"
      :items="personalData.foundryActivity"
      data-type="foundry"
      @item-action="handleFoundryAction"
      @time-filter-change="handleTimeFilterChange"
    />

    <!-- Trophy Achievements -->
    <BasePersonalObservatory
      title="Trophy Achievements"
      subtitle="Unlocked achievements and trophies"
      icon="game-icons:trophy"
      :items="personalData.trophyAchievements"
      data-type="trophies"
      @item-action="handleTrophyAction"
      @time-filter-change="handleTimeFilterChange"
    />

    <!-- Event Participation -->
    <BasePersonalObservatory
      title="Event Participation"
      subtitle="Guild events and activities participated in"
      icon="game-icons:calendar"
      :items="personalData.eventParticipation"
      data-type="events"
      @item-action="handleEventAction"
      @time-filter-change="handleTimeFilterChange"
    />

    <!-- Minigame Activity -->
    <BasePersonalObservatory
      title="Minigame Activity"
      subtitle="Tavern games and minigame results"
      icon="game-icons:gamepad"
      :items="personalData.minigameActivity"
      data-type="minigames"
      @item-action="handleMinigameAction"
      @time-filter-change="handleTimeFilterChange"
    />

    <!-- Voting Activity -->
    <BasePersonalObservatory
      title="Voting Activity"
      subtitle="DAO proposals and voting participation"
      icon="game-icons:voting"
      :items="personalData.votingActivity"
      data-type="voting"
      @item-action="handleVotingAction"
      @time-filter-change="handleTimeFilterChange"
    />

    <!-- Token Activity -->
    <BasePersonalObservatory
      title="Token Activity"
      subtitle="Token transactions and transfers"
      icon="game-icons:wallet"
      :items="personalData.tokenActivity"
      data-type="tokens"
      @item-action="handleTokenAction"
      @time-filter-change="handleTimeFilterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BasePersonalObservatory from '@/components/BasePersonalObservatory.vue'

// Import the personal data
import personalDataJson from '@/../public/SLP/observatory/g1_personal_alice_prospect.json'

// State
const personalData = ref(personalDataJson)

// Methods
const handleQuestAction = (item: any) => {
  console.log('Quest action:', item)
  // Handle quest-specific actions
}

const handleFoundryAction = (item: any) => {
  console.log('Foundry action:', item)
  // Handle foundry-specific actions
}

const handleTrophyAction = (item: any) => {
  console.log('Trophy action:', item)
  // Handle trophy-specific actions
}

const handleEventAction = (item: any) => {
  console.log('Event action:', item)
  // Handle event-specific actions
}

const handleMinigameAction = (item: any) => {
  console.log('Minigame action:', item)
  // Handle minigame-specific actions
}

const handleVotingAction = (item: any) => {
  console.log('Voting action:', item)
  // Handle voting-specific actions
}

const handleTokenAction = (item: any) => {
  console.log('Token action:', item)
  // Handle token-specific actions
}

const handleTimeFilterChange = (filter: string) => {
  console.log('Time filter changed:', filter)
  // Handle time filter changes if needed
}

// Lifecycle
onMounted(() => {
  console.log('Personal Observatory Demo loaded with data:', personalData.value)
})
</script>

<style scoped>
.personal-observatory-demo {
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  background: var(--theme-background);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--secondary-color-0);
  margin-bottom: var(--space-md);
}

.demo-header p {
  font-size: 1.125rem;
  color: var(--secondary-color-1);
  opacity: 0.8;
}

/* Add some spacing between components */
.personal-observatory-demo > * + * {
  margin-top: var(--space-xl);
}

/* Responsive */
@media (max-width: 768px) {
  .personal-observatory-demo {
    padding: var(--space-md);
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .demo-header p {
    font-size: 1rem;
  }
}
</style>
