<template>
  <div class="base-foundry">
    <!-- Primary Card with Title and Navigation -->
    <BaseCard 
      :title="FOUNDRY_TITLE" 
      variant="primary" 
      size="lg"
      class="foundry-header-card"
    >
      <!-- Quick Jump Navigation Buttons -->
      <div class="foundry-navigation">
        <BaseButton
          v-for="tab in foundryStore.availableTabs"
          :key="tab.id"
          :variant="currentTab?.id === tab.id ? 'accent' : 'outline'"
          :icon="tab.icon"
          size="md"
          class="foundry-nav-button"
          @click="handleTabClick(tab.id)"
        >
          {{ tab.title }}
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="foundry-main-card"
    >
      <!-- Content slot for specific foundry implementations -->
      <slot />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseCard, BaseButton } from '@/components/base'
import { useFoundryStore } from '@/stores/foundryStore'
import { FOUNDRY_TABS } from '@/constants/foundry'

// Constants
const FOUNDRY_TITLE = 'Foundry'
const DEFAULT_TAB = FOUNDRY_TABS.NFT

// Composables
const router = useRouter()
const route = useRoute()
const foundryStore = useFoundryStore()

// Computed properties
const currentTab = computed(() => foundryStore.currentTab)

// Methods
const handleTabClick = (tabId: string) => {
  foundryStore.setCurrentTab(tabId)
  const tab = foundryStore.availableTabs.find(t => t.id === tabId)
  if (tab) {
    router.push(tab.route)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
}

const updateTabFromRoute = (path: string) => {
  const pathSegments = path.split('/')
  const foundryTab = pathSegments[pathSegments.length - 1]
  
  if (foundryTab && foundryTab !== 'foundry') {
    foundryStore.setCurrentTab(foundryTab)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  } else if (foundryTab === 'foundry') {
    foundryStore.setCurrentTab(DEFAULT_TAB)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
}

// Watch for route changes to update current tab
watch(() => route.path, updateTabFromRoute, { immediate: true })
</script>

<style scoped>
.base-foundry {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  min-height: 100vh;
  background: var(--theme-background);
}

.foundry-header-card {
  width: 100%;
  max-width: 100%;
}

.foundry-navigation {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.foundry-nav-button {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.foundry-main-card {
  width: 100%;
  max-width: 100%;
  min-height: 90vh;
}

/* Wide screen margin */
@media (min-width: 1400px) {
  .foundry-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .foundry-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .base-foundry {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .base-foundry {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .foundry-navigation {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .foundry-nav-button {
    max-width: none;
    width: 100%;
  }
  
  .foundry-main-card {
    min-height: 80vh;
  }
}

@media (max-width: 480px) {
  .base-foundry {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .foundry-navigation {
    gap: var(--space-xs);
  }
  
  .foundry-main-card {
    min-height: 70vh;
  }
}
</style>
