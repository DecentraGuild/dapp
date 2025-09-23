import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSlpPath } from '@/utils/api'

export interface Wallet {
  address: string
  name: string
}

export interface WalletBalance {
  walletID: string
  owner: string
  guilds: string[]
  balances: Record<string, number>
  lastUpdated: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const selectedWallet = ref<Wallet | null>(null)
  const walletBalance = ref<WalletBalance | null>(null)
  const availableWallets = ref<Wallet[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!selectedWallet.value)
  const userGuilds = computed(() => walletBalance.value?.guilds || [])
  const hasGuilds = computed(() => userGuilds.value.length > 0)

  // Actions
  const loadAvailableWallets = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Load wallets from SLP assets
      const response = await fetch(getSlpPath('userwallet/test_wallets.json'))
      if (!response.ok) throw new Error('Failed to load wallets')
      
      const wallets = await response.json()
      availableWallets.value = wallets
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load wallets'
      console.error('Error loading wallets:', err)
    } finally {
      isLoading.value = false
    }
  }

  const selectWallet = async (wallet: Wallet) => {
    try {
      isLoading.value = true
      error.value = null
      
      selectedWallet.value = wallet
      
      // Load wallet balance data
      const balanceResponse = await fetch(getSlpPath(`balance/wallet_${wallet.address}_balance.json`))
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        walletBalance.value = balanceData
      } else {
        // Create default balance if file doesn't exist
        walletBalance.value = {
          walletID: wallet.address,
          owner: wallet.name,
          guilds: [],
          balances: {
            sol: 0,
            usdc: 0,
            wbtc: 0,
            atlas: 0,
            polis: 0
          },
          lastUpdated: new Date().toISOString()
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select wallet'
      console.error('Error selecting wallet:', err)
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    selectedWallet.value = null
    walletBalance.value = null
    error.value = null
  }

  const demoLogin = async () => {
    try {
      // Load available wallets first
      if (availableWallets.value.length === 0) {
        await loadAvailableWallets()
      }
      
      // Find Alice's wallet
      const aliceWallet = availableWallets.value.find(w => w.name === 'Alice')
      if (aliceWallet) {
        await selectWallet(aliceWallet)
      }
    } catch (err) {
      console.error('Demo login failed:', err)
    }
  }

  const getBalance = (token: string) => {
    return walletBalance.value?.balances[token] || 0
  }

  const isInGuild = (guildId: string) => {
    return userGuilds.value.includes(guildId)
  }

  return {
    // State
    selectedWallet,
    walletBalance,
    availableWallets,
    isLoading,
    error,
    
    // Getters
    isLoggedIn,
    userGuilds,
    hasGuilds,
    
    // Actions
    loadAvailableWallets,
    selectWallet,
    logout,
    demoLogin,
    getBalance,
    isInGuild
  }
})
