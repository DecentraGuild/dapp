<template>
  <div class="command-center">
    <!-- Primary Card with Title -->
    <BaseCard 
      title="Command Center" 
      variant="primary" 
      size="lg"
      class="command-center-header-card"
    >
      <div class="command-center-intro">
        <p class="intro-text">
          Manage all aspects of your guild from this central hub. 
          Select a room below to access specific management tools and controls.
        </p>
      </div>
    </BaseCard>

    <!-- Main Content Area with Room Cards -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="command-center-main-card"
    >
      <!-- Room Management Cards Grid -->
      <div class="command-center-rooms">
        <BaseCard
          v-for="room in availableRooms"
          :key="room.id"
          variant="primary"
          size="md"
          class="room-card"
          hover
        >
          <div class="room-card-content">
            <div class="room-header">
              <Icon :icon="room.icon" class="room-icon" />
              <h3 class="room-title">{{ room.title }}</h3>
            </div>
            <p class="room-description">{{ room.description }}</p>
            <BaseButton
              variant="accent"
              size="sm"
              class="room-manage-button"
              @click="handleRoomManage(room.id)"
            >
              <Icon icon="game-icons:gear-hammer" class="button-icon" />
              Manage
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseButton } from '@/components/base'
import { Icon } from '@iconify/vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useThemeStore } from '@/stores/themeStore'

// Composables
const { spacing, typography, borderRadius, colors } = useDesignTokens()
const themeStore = useThemeStore()

// Available rooms for management
const availableRooms = ref([
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview of guild activities and key metrics',
    icon: 'game-icons:chart',
    path: '/dashboard'
  },
  {
    id: 'questboard',
    title: 'Quest Board',
    description: 'Manage quests and member activities',
    icon: 'game-icons:target-dummy',
    path: '/questboard'
  },
  {
    id: 'tavern',
    title: 'Tavern',
    description: 'Events, raffles, poker, and dice games',
    icon: 'game-icons:castle',
    path: '/tavern'
  },
  {
    id: 'armory',
    title: 'Armory',
    description: 'Guild2Player trades and marketplace',
    icon: 'game-icons:armory',
    path: '/armory'
  },
  {
    id: 'foundry',
    title: 'Foundry',
    description: 'Create NFTs, tokens, and custom assets',
    icon: 'game-icons:foundry',
    path: '/foundry'
  },
  {
    id: 'trophy-room',
    title: 'Trophy Room',
    description: 'View achievements and guild accomplishments',
    icon: 'game-icons:trophy',
    path: '/trophy-room'
  },
  {
    id: 'dao-voting',
    title: 'DAO Voting',
    description: 'Governance and voting mechanisms',
    icon: 'game-icons:two-coins',
    path: '/dao-voting'
  },
  {
    id: 'vaults',
    title: 'Vaults',
    description: 'Financial management and treasury',
    icon: 'game-icons:bank',
    path: '/vaults'
  },
  {
    id: 'observatory',
    title: 'Observatory',
    description: 'Analytics and reporting dashboard',
    icon: 'game-icons:chart',
    path: '/reports'
  },
  {
    id: 'gatekeeping',
    title: 'Gatekeeping',
    description: 'Member permissions and access control',
    icon: 'game-icons:shield',
    path: '/gatekeeping'
  },
  {
    id: 'community-hub',
    title: 'Community Hub',
    description: 'Guild and member profiles',
    icon: 'game-icons:castle',
    path: '/communityhub'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'External service connections',
    icon: 'game-icons:abstract-050',
    path: '/integrations'
  }
])

// Methods
const handleRoomManage = (roomId: string) => {
  // TODO: Implement room management functionality
  // This could open a modal, navigate to a specific management view, etc.
}
</script>

<style scoped>
.command-center {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  min-height: 100vh;
  background: var(--theme-background);
}

.command-center-header-card {
  width: 100%;
  max-width: 100%;
}

.command-center-rooms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.room-card {
  transition: all var(--transition-normal);
  cursor: pointer;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.room-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  height: 100%;
}

.room-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.room-icon {
  font-size: 1.5rem;
  color: var(--secondary-color-0);
}

.room-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0;
}

.room-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.room-manage-button {
  margin-top: auto;
  align-self: flex-start;
}

.button-icon {
  margin-right: var(--space-xs);
}

.command-center-intro {
  text-align: center;
  margin-top: var(--space-md);
}

.intro-text {
  font-size: var(--text-lg);
  color: var(--text-color-1);
  margin: 0;
  line-height: 1.6;
}

.command-center-main-card {
  width: 100%;
  max-width: 100%;
  min-height: 60vh;
}

/* Wide screen margin */
@media (min-width: 1400px) {
  .command-center-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .command-center-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .command-center {
    padding: var(--space-md);
  }
  
  .command-center-rooms {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .command-center {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .command-center-rooms {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
  
  .intro-text {
    font-size: var(--text-base);
  }
}

@media (max-width: 480px) {
  .command-center {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .intro-text {
    font-size: var(--text-sm);
  }
}
</style>
