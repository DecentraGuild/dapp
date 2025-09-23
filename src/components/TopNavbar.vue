<template>
  <div 
    class="top-navbar"
    :style="navbarStyles"
  >
    <!-- Left Section: Guild Logo + Dashboard Icon -->
    <div class="left-section">
      <!-- Guild Logo -->
      <div v-if="guildStore.hasActiveGuild" class="guild-logo-container">
        <img 
          :src="guildStore.guildLogo" 
          :alt="guildStore.guildName"
          class="guild-logo"
        />
      </div>
      <div v-else class="guild-logo-container">
        <Icon icon="game-icons:castle" class="default-guild-icon" />
      </div>
      
      <!-- Dashboard Icon (clickable) -->
      <button 
        class="dashboard-button"
        @click="navigateToDashboard"
        :style="buttonStyles"
      >
        <Icon icon="game-icons:chart" class="dashboard-icon" />
      </button>
    </div>

    <!-- Center Section: Token Balances (only show when logged in) -->
    <div v-if="isLoggedIn" class="center-section">
      <div v-if="hasActiveGuild && hasTokenBalance" class="token-balances">
        <div class="token-balance-field">
          <Icon icon="game-icons:coins" class="token-icon" />
          <span class="token-text">{{ token1Name }}: {{ formatTokenAmount(token1Balance) }}</span>
        </div>
        <div class="token-balance-field">
          <Icon icon="game-icons:gem" class="token-icon" />
          <span class="token-text">{{ token2Name }}: {{ formatTokenAmount(token2Balance) }}</span>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-else-if="hasActiveGuild && memberStore.isLoading" class="token-balances-loading">
        <Icon icon="mdi:loading" class="loading-icon spinning" />
        <span class="loading-text">Loading balances...</span>
      </div>
    </div>

    <!-- Right Section: Theme, Member, Guild, Wallet Connect -->
    <div class="right-section">
      <!-- Theme Selector -->
      <div class="theme-selector">
        <button 
          class="theme-button nav-button"
          @click="toggleThemeDropdown"
          :style="buttonStyles"
        >
          <Icon 
            :icon="currentTheme?.id?.includes('spaceship') ? 'game-icons:space-suit' : 'game-icons:castle'" 
            class="theme-icon button-icon" 
          />
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
              @error="console.warn('Failed to load theme image:', theme.images?.[0])"
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

      <!-- Guild Dropdown -->
      <BaseButtonDropdown
        :model-value="selectedGuild"
        :items="guildOptionsForDropdown"
        :disabled="!isLoggedIn || isLoadingGuilds"
        icon="game-icons:castle"
        button-text="Guild"
        @update:model-value="handleGuildSelect"
      >
        <template #title="{ item }">
          {{ item.name }}
        </template>
        <template #icon="{ item }">
          <img 
            v-if="item.logo" 
            :src="item.logo" 
            :alt="item.name"
            class="guild-logo"
          />
          <Icon v-else icon="game-icons:castle" />
        </template>
      </BaseButtonDropdown>

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
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../composables/useSkinTheme'
import { useUserStore } from '@/stores/userStore'
import { useGuildStore } from '@/stores/guildStore'
import { useMemberStore } from '@/stores/memberStore'
import { useThemeStore } from '@/stores/themeStore'
import BaseButtonDropdown from './base/BaseButtonDropdown.vue'

// Composables
const router = useRouter()
const route = useRoute()
const { getPrimaryColor, getSecondaryColor } = useSkinTheme()
const userStore = useUserStore()
const guildStore = useGuildStore()
const memberStore = useMemberStore()
const themeStore = useThemeStore()

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
const guildOptions = computed(() => {
  // Only show guilds that the user is a member of
  return guildStore.availableGuilds.filter(guild => 
    userStore.isInGuild(guild.id)
  )
})

const guildOptionsForDropdown = computed(() => {
  // Remove description to only show logo + name
  return guildOptions.value.map(guild => {
    const { description, ...guildWithoutDescription } = guild
    return guildWithoutDescription
  })
})
const isLoadingWallets = computed(() => userStore.isLoading)
const isLoadingGuilds = computed(() => guildStore.isLoading)
const memberCounts = computed(() => {
  const counts: Record<string, number> = {}
  guildStore.availableGuilds.forEach(guild => {
    counts[guild.id] = guild.id === guildStore.guildId ? guildStore.memberCount : 0
  })
  return counts
})

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

const handleGuildSelect = async (guild: any) => {
  if (guild) {
    await guildStore.selectGuild(guild.id)
    
    // Load member profile for current user
    if (userStore.selectedWallet) {
      await memberStore.loadMemberProfile(
        userStore.selectedWallet.address, 
        guild.id
      )
    }
    
    // Load guild theme
    await themeStore.loadGuildTheme(guild.id)
    
    // Always redirect to dashboard when guild is selected
    router.push('/dashboard')
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

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-selector')) {
    showThemeDropdown.value = false
  }
}

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
  height: 48px;
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

.guild-logo-container {
  display: flex;
  align-items: center;
}

.guild-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.default-guild-icon {
  width: 32px;
  height: 32px;
  color: var(--secondary-color-0);
  background: var(--primary-color-1);
  border-radius: 6px;
  padding: 0.5rem;
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.dashboard-button {
  background: var(--primary-color-0);
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-button:hover {
  background-color: var(--primary-color-2);
  transform: translateX(4px);
}

.dashboard-icon {
  font-size: 1.5rem;
  color: var(--secondary-color-0);
  margin-right: 0.75rem;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.dashboard-button:hover .dashboard-icon {
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
  border-radius: 8px;
  transition: all 0.2s ease;
}

.token-icon {
  font-size: 1.25rem;
  color: var(--secondary-color-0);
  flex-shrink: 0;
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
  border-radius: 12px;
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
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  min-width: 120px;
  justify-content: space-between;
  text-align: left;
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
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  width: 24px;
  height: 24px;
  border-radius: 4px;
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
  gap: 0;
}

.member-button {
  margin-left: 1rem;
}

.right-section > *:not(.theme-selector):not(.member-button) {
  margin-left: 0.75rem;
}

.nav-button {
  background: var(--primary-color-0);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  text-align: left;
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
  min-width: 200px;
}

.guild-section {
  display: none;
}

.guild-logo {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  object-fit: cover;
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
    height: 42px;
  }
  
  .guild-logo {
    width: 28px;
    height: 28px;
  }
  
  .dashboard-button {
    padding: 0.6rem 0.75rem;
  }
  
  .dashboard-icon {
    font-size: 1.3rem;
    margin-right: 0.5rem;
  }
  
  .token-balances {
    gap: 0.75rem;
  }
  
  .token-balance-field {
    padding: 0.6rem 0.75rem;
  }
  
  .token-icon {
    font-size: 1.1rem;
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
    padding: 0.6rem 0.75rem;
    min-width: 100px;
  }
  
  .theme-text {
    font-size: 0.8rem;
  }
  
  .theme-icon {
    font-size: 1.3rem;
    margin-right: 0.5rem;
  }
  
  .nav-button {
    padding: 0.6rem 0.75rem;
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
  
  .nav-button {
    padding: 0.6rem;
  }
  
  .theme-text {
    display: none;
  }
  
  .theme-button {
    min-width: auto;
    padding: 0.6rem;
  }
  
  .token-balances {
    gap: 0.5rem;
  }
  
  .token-balance-field {
    padding: 0.6rem;
  }
  
  .token-icon {
    font-size: 1rem;
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
