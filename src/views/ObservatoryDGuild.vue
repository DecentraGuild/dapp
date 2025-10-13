<template>
  <BaseObservatory>
    <div class="observatory-dguild-content">
      <!-- Guild Overview -->
      <BaseSummaryObservatory
        title="Guild Overview"
        subtitle="Key guild metrics and member statistics"
        icon="game-icons:castle"
        :key-metrics="overviewMetrics"
        :distributions="guildDistributions"
        :recent-activity="guildRecentActivity"
        data-type="guild"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Quest Summary -->
      <BaseSummaryObservatory
        title="Quest Summary"
        subtitle="Quest completion and participation statistics"
        icon="game-icons:scroll"
        :key-metrics="questsMetrics"
        :distributions="questDistributions"
        :recent-activity="questRecentActivity"
        data-type="goals"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Goals Summary -->
      <BaseSummaryObservatory
        title="Goals Summary"
        subtitle="Guild goals and progress tracking"
        icon="game-icons:target"
        :key-metrics="goalsMetrics"
        :progress-goals="goalsProgressGoals"
        :recent-activity="goalsRecentActivity"
        data-type="goals"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @goal-click="handleGoalClick"
        @activity-click="handleActivityClick"
      />

      <!-- Events Summary -->
      <BaseSummaryObservatory
        title="Events Summary"
        subtitle="Guild events and attendance statistics"
        icon="game-icons:calendar"
        :key-metrics="eventsMetrics"
        :distributions="eventsDistributions"
        :recent-activity="eventsRecentActivity"
        data-type="events"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Foundry Summary -->
      <BaseSummaryObservatory
        title="Foundry Summary"
        subtitle="Token and resource minting statistics"
        icon="game-icons:anvil"
        :key-metrics="foundryMetrics"
        :distributions="foundryDistributions"
        :recent-activity="foundryRecentActivity"
        data-type="foundry"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Minigame Summary -->
      <BaseSummaryObservatory
        title="Minigame Summary"
        subtitle="Tavern games and player statistics"
        icon="game-icons:gamepad"
        :key-metrics="gamesMetrics"
        :distributions="minigameDistributions"
        :recent-activity="minigameRecentActivity"
        data-type="minigame"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Voting Summary -->
      <BaseSummaryObservatory
        title="Voting Summary"
        subtitle="DAO proposals and voting participation"
        icon="game-icons:voting"
        :key-metrics="votingMetrics"
        :distributions="votingDistributions"
        :recent-activity="votingRecentActivity"
        data-type="voting"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />
    </div>
  </BaseObservatory>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseObservatory from '@/components/BaseObservatory.vue'
import BaseSummaryObservatory from '@/components/BaseSummaryObservatory.vue'

// Import the dGuild data
import dguildDataJson from '@/../public/SLP/observatory/g1-dguild.json'

// State
const dguildData = ref(dguildDataJson)

// Computed properties for different sections
const overviewMetrics = computed(() => [
  {
    id: 'total_members',
    label: 'Total Members',
    value: dguildData.value.overview.totalMembers,
    format: 'number' as const,
    icon: 'game-icons:person'
  },
  {
    id: 'active_members',
    label: 'Active Members',
    value: dguildData.value.overview.activeMembers,
    format: 'number' as const,
    icon: 'game-icons:person-check'
  },
  {
    id: 'guild_level',
    label: 'Guild Level',
    value: dguildData.value.overview.guildLevel,
    format: 'number' as const,
    icon: 'game-icons:level-up'
  },
  {
    id: 'reputation',
    label: 'Reputation',
    value: dguildData.value.overview.reputation,
    format: 'number' as const,
    icon: 'game-icons:star'
  },
  {
    id: 'total_xp',
    label: 'Total XP',
    value: dguildData.value.overview.totalXP,
    format: 'number' as const,
    icon: 'game-icons:xp'
  },
  {
    id: 'total_tokens',
    label: 'Total Tokens',
    value: dguildData.value.overview.totalTokens,
    format: 'number' as const,
    icon: 'game-icons:coins'
  }
])

const guildDistributions = computed(() => [
  {
    id: 'role_distribution',
    title: 'Role Distribution',
    items: Object.entries(dguildData.value.overview.roleDistribution).map(([role, count]) => ({
      key: role,
      label: role.charAt(0).toUpperCase() + role.slice(1),
      value: count as number,
      percentage: ((count as number) / dguildData.value.overview.totalMembers) * 100
    }))
  },
  {
    id: 'dao_participation',
    title: 'DAO Participation',
    items: Object.entries(dguildData.value.overview.daoParticipation).map(([dao, count]) => ({
      key: dao,
      label: dao.replace('g1_dao_', '').replace('_', ' ').toUpperCase(),
      value: count as number,
      percentage: ((count as number) / dguildData.value.overview.totalMembers) * 100
    }))
  }
])

const questsMetrics = computed(() => [
  {
    id: 'total_quests',
    label: 'Total Quests',
    value: dguildData.value.quests.totalQuests,
    format: 'number' as const,
    icon: 'game-icons:scroll'
  },
  {
    id: 'completed_quests',
    label: 'Completed',
    value: dguildData.value.quests.completedQuests,
    format: 'number' as const,
    icon: 'game-icons:check-mark'
  },
  {
    id: 'completion_rate',
    label: 'Completion Rate',
    value: dguildData.value.quests.completionRate,
    format: 'percentage' as const,
    icon: 'game-icons:target'
  },
  {
    id: 'total_participants',
    label: 'Total Participants',
    value: dguildData.value.quests.totalParticipants,
    format: 'number' as const,
    icon: 'game-icons:person'
  },
  {
    id: 'total_xp_rewarded',
    label: 'XP Rewarded',
    value: dguildData.value.quests.totalXPRewarded,
    format: 'number' as const,
    icon: 'game-icons:xp'
  },
  {
    id: 'total_tokens_rewarded',
    label: 'Tokens Rewarded',
    value: dguildData.value.quests.totalTokensRewarded,
    format: 'number' as const,
    icon: 'game-icons:coins'
  }
])

const questDistributions = computed(() => [
  {
    id: 'quest_types',
    title: 'Quest Types',
    items: Object.entries(dguildData.value.quests.questTypes).map(([type, count]) => ({
      key: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: count as number,
      percentage: ((count as number) / dguildData.value.quests.totalQuests) * 100
    }))
  },
  {
    id: 'difficulty_distribution',
    title: 'Difficulty Distribution',
    items: Object.entries(dguildData.value.quests.difficultyDistribution).map(([difficulty, count]) => ({
      key: difficulty,
      label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      value: count as number,
      percentage: ((count as number) / dguildData.value.quests.totalQuests) * 100
    }))
  }
])

const goalsMetrics = computed(() => [
  {
    id: 'total_goals',
    label: 'Total Goals',
    value: dguildData.value.goals.totalGoals,
    format: 'number' as const,
    icon: 'game-icons:target'
  },
  {
    id: 'completed_goals',
    label: 'Completed',
    value: dguildData.value.goals.completedGoals,
    format: 'number' as const,
    icon: 'game-icons:check-mark'
  },
  {
    id: 'overall_progress',
    label: 'Overall Progress',
    value: dguildData.value.goals.overallProgress,
    format: 'percentage' as const,
    icon: 'game-icons:progress'
  },
  {
    id: 'deadlines_this_month',
    label: 'Deadlines This Month',
    value: dguildData.value.goals.deadlinesThisMonth,
    format: 'number' as const,
    icon: 'game-icons:calendar'
  }
])

const goalsProgressGoals = computed(() => [
  {
    id: 'membership_goal',
    title: 'Membership Growth',
    current: dguildData.value.overview.memberGrowth,
    target: 20,
    progress: Math.min((dguildData.value.overview.memberGrowth / 20) * 100, 100),
    format: 'number' as const
  },
  {
    id: 'xp_goal',
    title: 'XP Accumulation',
    current: dguildData.value.overview.totalXP,
    target: 150000,
    progress: Math.min((dguildData.value.overview.totalXP / 150000) * 100, 100),
    format: 'number' as const
  },
  {
    id: 'reputation_goal',
    title: 'Reputation Building',
    current: dguildData.value.overview.reputation,
    target: 1000,
    progress: Math.min((dguildData.value.overview.reputation / 1000) * 100, 100),
    format: 'number' as const
  }
])

const eventsMetrics = computed(() => [
  {
    id: 'total_events',
    label: 'Total Events',
    value: dguildData.value.events.totalEvents,
    format: 'number' as const,
    icon: 'game-icons:calendar'
  },
  {
    id: 'events_this_month',
    label: 'This Month',
    value: dguildData.value.events.eventsThisMonth,
    format: 'number' as const,
    icon: 'game-icons:calendar-check'
  },
  {
    id: 'total_participants',
    label: 'Total Participants',
    value: dguildData.value.events.totalParticipants,
    format: 'number' as const,
    icon: 'game-icons:person'
  },
  {
    id: 'attendance_rate',
    label: 'Attendance Rate',
    value: dguildData.value.events.attendanceRate,
    format: 'percentage' as const,
    icon: 'game-icons:target'
  },
  {
    id: 'total_rewards',
    label: 'Rewards Distributed',
    value: dguildData.value.events.totalRewardsDistributed,
    format: 'number' as const,
    icon: 'game-icons:coins'
  }
])

const eventsDistributions = computed(() => [
  {
    id: 'event_types',
    title: 'Event Types',
    items: Object.entries(dguildData.value.events.eventsByType).map(([type, count]) => ({
      key: type,
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count as number,
      percentage: ((count as number) / dguildData.value.events.totalEvents) * 100
    }))
  }
])

const foundryMetrics = computed(() => [
  {
    id: 'total_operations',
    label: 'Total Operations',
    value: dguildData.value.foundry.totalMintingOperations,
    format: 'number' as const,
    icon: 'game-icons:anvil'
  },
  {
    id: 'total_participants',
    label: 'Participants',
    value: dguildData.value.foundry.totalParticipants,
    format: 'number' as const,
    icon: 'game-icons:person'
  },
  {
    id: 'total_tokens_minted',
    label: 'Tokens Minted',
    value: dguildData.value.foundry.totalTokensMinted,
    format: 'number' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'total_resources_minted',
    label: 'Resources Minted',
    value: dguildData.value.foundry.totalResourcesMinted,
    format: 'number' as const,
    icon: 'game-icons:gem'
  },
  {
    id: 'net_cost',
    label: 'Net Cost',
    value: dguildData.value.foundry.netCost,
    format: 'currency' as const,
    icon: 'game-icons:wallet'
  }
])

const foundryDistributions = computed(() => [
  {
    id: 'operation_types',
    title: 'Operation Types',
    items: Object.entries(dguildData.value.foundry.operationsByType).map(([type, count]) => ({
      key: type,
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count as number,
      percentage: ((count as number) / dguildData.value.foundry.totalMintingOperations) * 100
    }))
  }
])

const gamesMetrics = computed(() => [
  {
    id: 'total_games',
    label: 'Total Games',
    value: dguildData.value.games.totalGamesPlayed,
    format: 'number' as const,
    icon: 'game-icons:gamepad'
  },
  {
    id: 'total_players',
    label: 'Total Players',
    value: dguildData.value.games.totalPlayers,
    format: 'number' as const,
    icon: 'game-icons:person'
  },
  {
    id: 'total_winnings',
    label: 'Total Winnings',
    value: dguildData.value.games.totalWinnings,
    format: 'number' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'average_players',
    label: 'Avg Players/Game',
    value: dguildData.value.games.averagePlayersPerGame,
    format: 'number' as const,
    icon: 'game-icons:person-check'
  }
])

const minigameDistributions = computed(() => [
  {
    id: 'game_types',
    title: 'Game Types',
    items: Object.entries(dguildData.value.games.gamesByType).map(([type, count]) => ({
      key: type,
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count as number,
      percentage: ((count as number) / dguildData.value.games.totalGamesPlayed) * 100
    }))
  }
])

const votingMetrics = computed(() => [
  {
    id: 'total_proposals',
    label: 'Total Proposals',
    value: dguildData.value.voting.totalProposals,
    format: 'number' as const,
    icon: 'game-icons:voting'
  },
  {
    id: 'proposals_passed',
    label: 'Proposals Passed',
    value: dguildData.value.voting.proposalsPassed,
    format: 'number' as const,
    icon: 'game-icons:check-mark'
  },
  {
    id: 'total_votes',
    label: 'Total Votes',
    value: dguildData.value.voting.totalVotes,
    format: 'number' as const,
    icon: 'game-icons:person'
  },
  {
    id: 'participation_rate',
    label: 'Participation Rate',
    value: dguildData.value.voting.averageParticipationRate,
    format: 'percentage' as const,
    icon: 'game-icons:target'
  }
])

const votingDistributions = computed(() => [
  {
    id: 'proposal_types',
    title: 'Proposal Types',
    items: Object.entries(dguildData.value.voting.proposalsByType).map(([type, count]) => ({
      key: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: count as number,
      percentage: ((count as number) / dguildData.value.voting.totalProposals) * 100
    }))
  }
])

// Recent activity data (simplified for demo)
const guildRecentActivity = computed(() => [
  {
    id: 'new_member',
    title: 'New Member Joined',
    description: 'Member capacity increased',
    amount: '+1 member',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
])

const questRecentActivity = computed(() => [
  {
    id: 'quest_completed',
    title: 'Quest Completed',
    description: 'Cyber Dragon quest finished',
    amount: '+2500 XP',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
])

const goalsRecentActivity = computed(() => [
  {
    id: 'goal_progress',
    title: 'Goal Progress',
    description: 'Membership goal advanced',
    amount: '+12%',
    timestamp: new Date().toISOString(),
    status: 'in-progress'
  }
])

const eventsRecentActivity = computed(() => [
  {
    id: 'event_hosted',
    title: 'Event Hosted',
    description: 'Poker tournament completed',
    amount: '38 participants',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
])

const foundryRecentActivity = computed(() => [
  {
    id: 'token_minted',
    title: 'Token Minted',
    description: 'New guild token created',
    amount: '1000 tokens',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
])

const minigameRecentActivity = computed(() => [
  {
    id: 'game_played',
    title: 'Game Played',
    description: 'Tavern Dice session',
    amount: '5 players',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
])

const votingRecentActivity = computed(() => [
  {
    id: 'proposal_voted',
    title: 'Proposal Voted',
    description: 'New guild rules proposal',
    amount: '95% participation',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
])

// Methods
const handleTimeFilterChange = (filter: string) => {
  console.log('Time filter changed:', filter)
  // Handle time filter changes
}

const handleMetricClick = (metric: any) => {
  console.log('Metric clicked:', metric)
  // Handle metric clicks
}

const handleGoalClick = (goal: any) => {
  console.log('Goal clicked:', goal)
  // Handle goal clicks
}

const handleActivityClick = (activity: any) => {
  console.log('Activity clicked:', activity)
  // Handle activity clicks
}

// Lifecycle
onMounted(() => {
  console.log('dGuild Observatory loaded with data:', dguildData.value)
})
</script>

<style scoped>
.observatory-dguild-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Wide screen margin - matching armory pattern */
@media (min-width: 1400px) {
  .observatory-dguild-content {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .observatory-dguild-content {
    gap: var(--space-lg);
  }
}
</style>