<template>
  <div 
    class="top-navbar"
    :style="navbarStyles"
  >
    <!-- Left Section: Guild Logo + Name + Dashboard Button -->
    <div class="left-section">
      <!-- Guild Logo + Name (clickable) -->
      <button 
        v-if="guildStore.hasActiveGuild" 
        class="guild-info-button"
        @click="navigateToGuildProfile"
        :style="buttonStyles"
      >
        <img 
          :src="guildStore.guildLogo" 
          :alt="guildStore.guildName"
          class="guild-logo"
        />
        <span class="guild-name">{{ guildStore.guildName }}</span>
      </button>
      <div v-else class="guild-info-container">
        <Icon icon="game-icons:castle" class="default-guild-icon" />
        <span class="guild-name">No Guild</span>
      </div>
      
      <!-- Dashboard Button (clickable) -->
      <button 
        class="dashboard-button"
        @click="navigateToDashboard"
        :style="buttonStyles"
      >
        <span class="dashboard-text">{{ getNavigationHeader('dashboard') }}</span>
      </button>
    </div>

    <!-- Center Section: Token Balances (only show when logged in) -->
    <div v-if="isLoggedIn" class="center-section">
      <div v-if="hasActiveGuild && hasTokenBalance" class="token-balances">
        <div class="token-balance-field">
          <img :src="token1Icon" :alt="memberStore.token1Symbol" class="token-icon" />
          <span class="token-text">{{ formatTokenAmount(token1Balance) }}</span>
        </div>
        <div class="token-balance-field">
          <img :src="token2Icon" :alt="memberStore.token2Symbol" class="token-icon" />
          <span class="token-text">{{ formatTokenAmount(token2Balance) }}</span>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-else-if="hasActiveGuild && memberStore.isLoading" class="token-balances-loading">
        <Icon icon="mdi:loading" class="loading-icon spinning" />
        <span class="loading-text">Loading balances...</span>
      </div>
    </div>

    <!-- Right Section: Tutorial, Theme, Member, Guild, Wallet Connect -->
    <div class="right-section">
      <!-- Reset Button (hidden when tutorials are disabled) -->
      <button 
        v-if="TUTORIAL_ENABLED"
        class="nav-button tutorial-button"
        @click="startTutorial"
        :style="buttonStyles"
        title="Reset & Start Tutorial"
      >
        <Icon icon="mdi:refresh" class="button-icon" />
        <span class="button-text">Reset</span>
      </button>

      <!-- Theme Selector -->
      <div class="theme-selector">
        <button 
          class="theme-button nav-button"
          @click="toggleThemeDropdown"
          :style="buttonStyles"
        >
          <span class="skin-label">Skin:</span>
          <span class="theme-text button-text">{{ currentTheme?.name || 'Theme' }}</span>
          <Icon icon="mdi:chevron-down" class="dropdown-icon" :class="{ 'rotated': showThemeDropdown }" />
        </button>
        
        <!-- Theme Dropdown -->
        <div v-if="showThemeDropdown" class="theme-dropdown" :style="dropdownStyles">
            <button
              v-for="theme in (availableThemes || [])"
              :key="theme.id"
              class="theme-option"
              @click="selectTheme(theme.id)"
              :class="{ 'active': theme.id === currentTheme?.id }"
            >
            <img 
              :src="theme.images?.[0] || ''" 
              :alt="theme.name" 
              class="theme-preview"
              @error="() => {}"
            />
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </div>

      <!-- Member Profile Button -->
      <button 
        class="nav-button member-button"
        @click="navigateToMemberProfile"
        :style="buttonStyles"
        :disabled="!isLoggedIn"
      >
        <Icon icon="game-icons:person" class="button-icon" />
        <span class="button-text">Member</span>
      </button>


      <!-- Wallet Dropdown -->
      <BaseButtonDropdown
        :model-value="selectedWallet"
        :items="walletOptions"
        :disabled="isLoadingWallets"
        icon="game-icons:wallet"
        button-text="Connect"
        @update:model-value="handleWalletSelect"
      >
        <template #title="{ item }">
          {{ item.name }}
        </template>
        <template #subtitle="{ item }">
          {{ formatAddress(item.address) }}
        </template>
        <template #icon="{ item }">
          <Icon icon="game-icons:wallet" />
        </template>
      </BaseButtonDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../composables/useSkinTheme'
import { useUserStore } from '@/stores/userStore'
import { useGuildStore } from '@/stores/guildStore'
import { useMemberStore } from '@/stores/memberStore'
import { useThemeStore } from '@/stores/themeStore'
import { TUTORIAL_ENABLED } from '@/config/features'
import { useTutorialStore } from '@/stores/tutorialStore'
import BaseButtonDropdown from './base/BaseButtonDropdown.vue'

// Composables
const router = useRouter()
const route = useRoute()
const { getPrimaryColor, getSecondaryColor, getNavigationHeader } = useSkinTheme()
const userStore = useUserStore()
const guildStore = useGuildStore()
const memberStore = useMemberStore()
const themeStore = useThemeStore()
const tutorialStore = useTutorialStore()

// Theme-related computed properties
const currentTheme = computed(() => themeStore.currentTheme)
const availableThemes = computed(() => themeStore.availableThemes)

// Theme selector state
const showThemeDropdown = ref(false)

// Computed properties
const isLoggedIn = computed(() => userStore.isLoggedIn)
const selectedWallet = computed(() => userStore.selectedWallet)
const selectedGuild = computed(() => guildStore.activeGuild)
const walletOptions = computed(() => userStore.availableWallets)
const hasActiveGuild = computed(() => guildStore.hasActiveGuild)
const hasTokenBalance = computed(() => memberStore.hasTokenBalance)
const token1Balance = computed(() => memberStore.token1Balance)
const token2Balance = computed(() => memberStore.token2Balance)
const token1Name = computed(() => memberStore.token1Name)
const token2Name = computed(() => memberStore.token2Name)
const token1Icon = computed(() => memberStore.token1Icon)
const token2Icon = computed(() => memberStore.token2Icon)
const isLoadingWallets = computed(() => userStore.isLoading)

// Computed styles
const navbarStyles = computed(() => ({
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1)
}))

const buttonStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2)
}))

const dropdownStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1)
}))

// Navigation methods
const navigateToDashboard = () => {
  router.push('/dashboard')
}

const navigateToMemberProfile = () => {
  if (isLoggedIn.value) {
    router.push('/communityhub/memberprofile')
  }
}

const navigateToGuildProfile = () => {
  if (isLoggedIn.value) {
    router.push('/communityhub/guildprofile')
  }
}

const handleWalletSelect = async (wallet: any) => {
  if (wallet) {
    await userStore.selectWallet(wallet)
  }
}


const formatAddress = (address: string) => {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

const formatTokenAmount = (amount: number) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  } else {
    return amount.toLocaleString()
  }
}

// Theme selector methods
const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
}

const selectTheme = async (themeId: string) => {
  await themeStore.loadTheme(themeId)
  showThemeDropdown.value = false
}

// Tutorial methods
const startTutorial = () => {
  // Reset tutorial completely (wipes localStorage and starts fresh)
  tutorialStore.reset()
  // Start fresh tutorial
  tutorialStore.startTutorial()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-selector')) {
    showThemeDropdown.value = false
  }
}

// Watch for guild changes and load guild colors
watch(() => guildStore.guildId, async (newGuildId) => {
  if (newGuildId) {
    await themeStore.loadGuildColors(newGuildId)
  }
}, { immediate: true })

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Load initial data
  if (userStore.availableWallets.length === 0) {
    await userStore.loadAvailableWallets()
  }
  if (guildStore.availableGuilds.length === 0) {
    await guildStore.loadAvailableGuilds()
  }
  if (themeStore.availableThemes.length === 0) {
    await themeStore.loadAvailableThemes()
  }
  
  // Theme will be automatically restored by themeStore.initializeDefaultTheme()
  // which is called during loadAvailableThemes() and will restore from localStorage
  
  // Load member data if user is logged in and has an active guild
  if (isLoggedIn.value && hasActiveGuild.value && selectedWallet.value) {
    await memberStore.loadMemberProfile(selectedWallet.value.address, guildStore.activeGuild?.id || 'guild-1')
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--space-3xl);
  background: var(--primary-color-0);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 1001;
  backdrop-filter: blur(10px);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.guild-info-button {
  background: none;
  border: none;
  border-radius: var(--theme-radius-md);
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  text-align: left;
  height: calc(var(--space-3xl) - 1px);
  box-sizing: border-box;
}

.guild-info-button:hover {
  background-color: var(--primary-color-2);
  transform: translateX(4px);
}

.guild-info-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border-radius: var(--theme-radius-md);
  opacity: 0.8;
  height: calc(var(--space-3xl) - 1px);
  box-sizing: border-box;
}

.guild-logo {
  height: var(--space-3xl);
  width: auto;
  object-fit: contain;
}

.guild-name {
  font-size: 1rem;
  color: var(--secondary-color-0);
  font-weight: 600;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.guild-info-button:hover .guild-name {
  color: var(--secondary-color-0);
}

.guild-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-0);
  border-radius: var(--border-radius-md);
  cursor: default;
  opacity: 0.8;
}

.default-guild-icon {
  height: var(--space-2xl);
  width: auto;
  color: var(--secondary-color-0);
  padding: 0.5rem;
}

.dashboard-button {
  background: var(--primary-color-0);
  border: none;
  border-radius: var(--theme-radius-md);
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--space-3xl) - 1px);
  box-sizing: border-box;
}

.dashboard-button:hover {
  background-color: var(--primary-color-2);
  transform: translateX(4px);
}

.dashboard-text {
  font-size: 1rem;
  color: var(--secondary-color-0);
  font-weight: 600;
  transition: color 0.2s ease;
}

.dashboard-button:hover .dashboard-text {
  color: var(--secondary-color-0);
}

.center-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.token-balances {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.token-balance-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--primary-color-0);
  border: none;
  border-radius: var(--theme-radius-md);
  transition: all 0.2s ease;
  height: calc(var(--space-3xl) - 1px);
  box-sizing: border-box;
}

.token-icon {
  height: var(--space-2xl);
  width: auto;
  flex-shrink: 0;
  object-fit: contain;
}

.token-text {
  font-size: 0.9rem;
  color: var(--secondary-color-0);
  font-weight: 600;
  white-space: nowrap;
}

.token-balances-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--theme-radius-lg);
}

.loading-icon {
  font-size: 1.25rem;
  color: var(--secondary-color-1);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.9rem;
  color: var(--secondary-color-1);
  font-weight: 500;
}


.theme-selector {
  position: relative;
  display: inline-block;
}

.theme-button {
  background: var(--primary-color-0);
  border: none;
  border-radius: var(--theme-radius-md);
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  min-width: var(--component-button-min-width);
  justify-content: space-between;
  text-align: left;
  height: calc(var(--space-3xl) - 1px);
  box-sizing: border-box;
}

.theme-button:hover {
  background-color: var(--primary-color-2);
  transform: translateX(4px);
}

.theme-icon {
  font-size: 1.5rem;
  color: var(--secondary-color-0);
  margin-right: 0.75rem;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.theme-button:hover .theme-icon {
  color: var(--secondary-color-0);
}

.theme-text {
  color: var(--secondary-color-0);
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.skin-label {
  font-size: 0.9rem;
  color: var(--secondary-color-1);
  font-weight: 500;
  white-space: nowrap;
  margin-right: 0.25rem;
}

.theme-button:hover .theme-text {
  color: var(--secondary-color-0);
}

.dropdown-icon {
  font-size: 1rem;
  color: var(--secondary-color-0);
  transition: all 0.2s ease;
}

.theme-button:hover .dropdown-icon {
  color: var(--secondary-color-0);
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-0);
  border-radius: var(--theme-radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1002;
  margin-top: 0.25rem;
  overflow: hidden;
}

.theme-option {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.theme-option:hover {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
}

.theme-option.active {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
}

.theme-preview {
  width: var(--space-lg);
  height: var(--space-lg);
  border-radius: var(--theme-radius-sm);
  object-fit: cover;
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.theme-name {
  color: var(--secondary-color-0);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.theme-option:hover .theme-name,
.theme-option.active .theme-name {
  color: var(--primary-color-0);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.member-button {
  margin-left: 0;
}

.right-section > *:not(.theme-selector):not(.member-button) {
  margin-left: 0;
}

.nav-button {
  background: var(--primary-color-0);
  border: none;
  border-radius: var(--theme-radius-md);
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  text-align: left;
  height: calc(var(--space-3xl) - 1px);
  box-sizing: border-box;
}

.nav-button:hover {
  background-color: var(--primary-color-2);
  transform: translateX(4px);
}

.button-icon {
  font-size: 1.5rem;
  color: var(--secondary-color-0);
  margin-right: 0.75rem;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.nav-button:hover .button-icon {
  color: var(--secondary-color-0);
}

.button-text {
  color: var(--secondary-color-0);
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-button:hover .button-text {
  color: var(--secondary-color-0);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button:disabled:hover {
  background: none;
  transform: none;
}

.wallet-section {
  min-width: 12.5rem;
}

.guild-section {
  display: none;
}

.guild-logo {
  height: var(--space-3xl);
  width: auto;
  object-fit: contain;
}

.wallet-connect {
  background: none;
  border: none;
}

.wallet-connect:hover {
  background-color: var(--secondary-color-2);
  transform: translateX(4px);
}

/* Responsive design */
@media (max-width: 768px) {
  .top-navbar {
    padding: 0 0.75rem;
    height: calc(var(--space-3xl) * 0.875);
  }
  
  .guild-logo {
    height: calc(var(--space-3xl) * 0.875);
    width: auto;
  }
  
  .guild-info-button {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .guild-name {
    font-size: 0.9rem;
  }
  
  .dashboard-button {
    padding: 0.75rem 1rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .dashboard-icon {
    font-size: 1.3rem;
    margin-right: 0.5rem;
  }
  
  .token-balances {
    gap: 0.75rem;
  }
  
  .token-balance-field {
    padding: 0.75rem 1rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .token-icon {
    height: calc(var(--space-3xl) * 0.875);
    width: auto;
  }
  
  .token-text {
    font-size: 0.8rem;
  }
  
  .member-button {
    margin-left: 0.75rem;
  }
  
  .right-section > *:not(.theme-selector):not(.member-button) {
    margin-left: 0.5rem;
  }
  
  .theme-button {
    padding: 0.75rem 1rem;
    min-width: calc(var(--component-button-min-width) * 0.8);
    height: calc(var(--space-3xl) - 1px);
  }
  
  .theme-text {
    font-size: 0.8rem;
  }
  
  .theme-icon {
    font-size: 1.3rem;
    margin-right: 0.5rem;
  }
  
  .nav-button {
    padding: 0.75rem 1rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .button-text {
    font-size: 0.8rem;
  }
  
  .button-icon {
    font-size: 1.3rem;
    margin-right: 0.5rem;
  }
}

@media (max-width: 480px) {
  .button-text {
    display: none;
  }
  
  .guild-name {
    display: none;
  }
  
  .nav-button {
    padding: 0.75rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .theme-text {
    display: none;
  }
  
  .theme-button {
    min-width: auto;
    padding: 0.75rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .token-balances {
    gap: 0.5rem;
  }
  
  .token-balance-field {
    padding: 0.75rem;
    height: calc(var(--space-3xl) - 1px);
  }
  
  .token-icon {
    height: calc(var(--space-3xl) * 0.75);
    width: auto;
  }
  
  .token-text {
    font-size: 0.75rem;
  }
  
  .member-button {
    margin-left: 0.5rem;
  }
  
  .right-section > *:not(.theme-selector):not(.member-button) {
    margin-left: 0.25rem;
  }
}
</style>
