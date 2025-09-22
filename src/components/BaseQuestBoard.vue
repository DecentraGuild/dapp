<template>
  <div class="base-quest-board">
    <!-- Primary Card with Title and Navigation -->
    <BaseCard 
      :title="QUEST_BOARD_TITLE" 
      variant="primary" 
      size="lg"
      class="quest-board-header-card"
    >
      <!-- Quick Jump Navigation Buttons -->
      <div class="quest-board-navigation">
        <BaseButton
          v-for="tab in questStore.availableTabs"
          :key="tab.id"
          :variant="currentTab?.id === tab.id ? 'accent' : 'outline'"
          :icon="tab.icon"
          size="md"
          class="quest-board-nav-button"
          @click="handleTabClick(tab.id)"
        >
          {{ tab.title }}
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <div class="quest-board-content">
      <!-- Sidebar with Status Filters -->
      <BaseSidebar
        :items="statusItems"
        variant="primary"
        position="left"
        width="var(--layout-sidebar-width)"
        @item-click="handleStatusClick"
      />

      <!-- Main Content Card -->
      <BaseCard 
        variant="neutral" 
        size="xl"
        class="quest-board-main-card"
      >
        <!-- Quest Snippets Grid -->
        <div v-if="questsByStatus.length > 0" class="quest-board-grid">
          <BaseCard
            v-for="quest in questsByStatus"
            :key="quest.questID"
            variant="primary"
            size="md"
            class="quest-board-snippet"
            :class="{ 'quest-board-snippet--selected': selectedQuest?.questID === quest.questID }"
            @click="handleQuestClick(quest)"
          >
            <BaseQuest
              :quest="quest"
              :is-selected="selectedQuest?.questID === quest.questID"
            />
          </BaseCard>
        </div>
        
        <!-- Empty State -->
        <div v-else class="quest-board-empty">
          <Icon icon="game-icons:question-mark" class="quest-board-empty__icon" />
          <h3>No Quests Found</h3>
          <p>No quests found for the selected status and type.</p>
        </div>

        <!-- Quest Details Component -->
        <div v-if="selectedQuest" class="quest-board-separator"></div>
        <BaseCard
          v-if="selectedQuest"
          variant="primary"
          size="xl"
          class="quest-board-details-card"
        >
          <QuestDetails
            ref="questDetailsRef"
            :quest="selectedQuest"
            @action="handleQuestAction"
          />
        </BaseCard>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseButton } from '@/components/base'
import BaseSidebar from '@/components/base/BaseSidebar.vue'
import BaseQuest from '@/components/base/BaseQuest.vue'
import QuestDetails from '@/components/QuestDetails.vue'
import { useQuestStore } from '@/stores/questStore'
import { QUEST_TABS } from '@/constants/quest'
import type { SidebarItem } from '@/components/base/BaseSidebar'
import type { Quest } from '@/constants/quest'

// Constants
const QUEST_BOARD_TITLE = 'Quest Board'
const DEFAULT_TAB = QUEST_TABS.INGAME

// Composables
const router = useRouter()
const route = useRoute()
const questStore = useQuestStore()

// State
const selectedStatus = ref<string>('new')
const questIndex = ref<any>(null)
const selectedQuest = ref<Quest | null>(null)
const questDetailsRef = ref<HTMLElement | null>(null)

// Computed properties
const currentTab = computed(() => questStore.currentTabInfo)

// Filtered quests by status
const questsByStatus = computed(() => {
  return questStore.questsByStatus
})

// Status items for sidebar
const statusItems = computed((): SidebarItem[] => {
  if (!questIndex.value) return []
  
  return questIndex.value.questIndex.sidebarItems.map((item: any) => ({
    id: item.id,
    icon: item.icon,
    title: item.name.toUpperCase(),
    active: selectedStatus.value === item.id,
    badge: (questStore.questStats as any)[item.id] || 0
  }))
})

// Methods
const handleTabClick = (tabId: string) => {
  questStore.setCurrentTab(tabId)
  const tab = questStore.availableTabs.find(t => t.id === tabId)
  if (tab) {
    router.push(tab.route)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
}

const updateTabFromRoute = (path: string) => {
  if (path === '/quest/game') {
    questStore.setCurrentTab(QUEST_TABS.INGAME)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  } else if (path === '/quest/guild') {
    questStore.setCurrentTab(QUEST_TABS.GUILD)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
}

// Watch for route changes to update current tab
watch(() => route.path, updateTabFromRoute, { immediate: true })

// Methods
const handleStatusClick = (item: SidebarItem) => {
  selectedStatus.value = item.id!
  questStore.setStatusFilter(item.id!)
  // Reset selected quest when switching status
  selectedQuest.value = null
}

const loadQuestIndex = async () => {
  try {
    const response = await fetch('/SLP/quests/quest-index.json')
    if (response.ok) {
      questIndex.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading quest index:', error)
  }
}

// Quest interaction methods
const handleQuestClick = async (quest: Quest) => {
  // If the same quest is clicked again, close the details
  if (selectedQuest.value?.questID === quest.questID) {
    selectedQuest.value = null
    return
  }
  
  // Otherwise, select the new quest
  selectedQuest.value = quest
  // Scroll to quest details after DOM update
  await nextTick()
  scrollToQuestDetails()
}

const handleQuestAction = (quest: Quest, action: string) => {
  console.log(`Quest action: ${action} for quest ${quest.questID}`)
  // TODO: Implement quest actions based on action type
  switch (action) {
    case 'sign_up':
      questStore.applyToQuest(quest.questID, 'current_member_id', 'Current Member', 'I would like to apply for this quest.')
      break
    case 'sign_off':
      // TODO: Implement sign off logic
      break
    case 'deliver':
      questStore.submitQuest(quest.questID, 'current_member_id')
      break
    case 'notify_validator':
      // TODO: Implement validator notification
      break
    case 'claim_rewards':
      // TODO: Implement reward claiming
      break
  }
}

const scrollToQuestDetails = () => {
  if (questDetailsRef.value) {
    questDetailsRef.value.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

// Load quests when component mounts
onMounted(() => {
  questStore.loadQuests()
  loadQuestIndex()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.base-quest-board {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  min-height: 100vh;
  background: var(--theme-background);
}

.quest-board-header-card {
  width: 100%;
  max-width: 100%;
}

.quest-board-navigation {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.quest-board-nav-button {
  flex: 1;
  min-width: var(--component-button-min-width);
  max-width: var(--component-button-max-width);
}

.quest-board-content {
  display: flex;
  min-height: 100%;
  background: var(--theme-background);
  position: relative;
}

.quest-board-main-card {
  flex: 1;
  width: 100%;
  max-width: 100%;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
}

.quest-board-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.quest-board-snippet {
  cursor: pointer;
  transition: all 0.2s ease;
  height: var(--component-card-height-md);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.quest-board-snippet:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.quest-board-snippet--selected {
  border-color: var(--primary-color-0);
  box-shadow: var(--shadow-lg);
  background: var(--primary-color-0-5);
}

.quest-board-snippet--selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--border-height-medium);
  background: var(--primary-color-0);
}

.quest-board-snippet--selected::after {
  content: 'Click to close details';
  position: absolute;
  bottom: var(--space-xs);
  right: var(--space-xs);
  background: var(--primary-color-0);
  color: var(--primary-color-0-contrast);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  opacity: 0.9;
  pointer-events: none;
}

.quest-board-separator {
  height: var(--border-height-thin);
  background: var(--border-color-1);
  margin: var(--space-lg) 0;
  border-radius: var(--border-width-thin);
}

.quest-board-details-card {
  width: 100%;
  margin-top: var(--space-lg);
}

.quest-board-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
  color: var(--text-color-2);
  min-height: var(--state-height-empty);
}

.quest-board-empty__icon {
  font-size: var(--component-icon-size-xl);
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.quest-board-empty h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-color-1);
}

.quest-board-empty p {
  font-size: var(--font-size-md);
  margin: 0;
}

/* Wide screen margin */
@media (min-width: 1400px) {
  .quest-board-header-card {
    margin: 0 var(--layout-wide-margin);
    width: var(--layout-wide-width);
    max-width: var(--layout-wide-width);
  }
  
  .quest-board-main-card {
    margin: 0 var(--layout-wide-margin);
    width: var(--layout-wide-width);
    max-width: var(--layout-wide-width);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .base-quest-board {
    padding: var(--space-md);
  }
  
  .quest-board-main-card {
    margin-left: var(--layout-content-margin);
  }
}

@media (max-width: 768px) {
  .base-quest-board {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .quest-board-navigation {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .quest-board-nav-button {
    max-width: none;
    width: 100%;
  }
  
  .quest-board-main-card {
    margin-left: var(--layout-content-margin-md);
    min-height: 80vh;
  }
  
  .quest-board-grid {
    grid-template-columns: 1fr;
    padding: var(--space-md);
  }
}

@media (max-width: 1024px) {
  .quest-board-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .quest-board-grid {
    grid-template-columns: 1fr;
    padding: var(--space-md);
  }
  
  .quest-board-snippet {
    height: var(--component-card-height-sm);
  }
}

@media (max-width: 480px) {
  .base-quest-board {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .quest-board-navigation {
    gap: var(--space-xs);
  }
  
  .quest-board-main-card {
    margin-left: var(--layout-content-margin-sm);
    min-height: 70vh;
  }
}
</style>
