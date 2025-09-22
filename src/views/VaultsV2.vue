<template>
  <div class="vaults-page">
    <!-- Primary Header Card -->
    <BaseCard 
      variant="primary" 
      size="lg" 
      class="vaults-header"
    >
      <template #header>
        <div class="header-content">
          <div class="header-title-row">
            <Icon icon="game-icons:treasure-map" class="header-icon" />
            <h1 class="header-title">Guild Vaults - Version 2</h1>
          </div>
          <p class="header-description">
            Manage and monitor your guild's treasury, token vaults, and income streams. 
            Track balances, exchange rates, and contribution metrics across all vault systems.
          </p>
        </div>
      </template>
    </BaseCard>

    <!-- Main Content Container -->
    <BaseCard 
      variant="neutral" 
      size="lg" 
      class="main-content-card"
    >
      <div class="main-content-container">
        <!-- Vault Cards Container (Left Side - 40%) -->
        <div class="vaults-container">
          <div class="vault-selector-header">
            <h3 class="vaults-title">Vault Selector</h3>
          </div>
          <div class="vaults-grid">
            <!-- Income Vault Card -->
            <div 
              class="vault-card vault-card-hover"
              :class="{ 'vault-card-selected': selectedVault === 'income' }"
              @click="selectVault('income')"
            >
              <h3 class="vault-card-title">Income Vault</h3>
              <BaseListGrid
                :items="incomeVaultData"
                :columns="2"
                size="sm"
                variant="neutral"
                :clickable="false"
                :hover="false"
              />
            </div>

            <!-- Guild Vault Card -->
            <div 
              class="vault-card vault-card-hover"
              :class="{ 'vault-card-selected': selectedVault === 'guild' }"
              @click="selectVault('guild')"
            >
              <h3 class="vault-card-title">Guild Vault</h3>
              <BaseListGrid
                :items="guildVaultData"
                :columns="2"
                size="sm"
                variant="neutral"
                :clickable="false"
                :hover="false"
              />
            </div>

            <!-- Token1 Vault Card -->
            <div 
              class="vault-card vault-card-hover"
              :class="{ 'vault-card-selected': selectedVault === 'token1' }"
              @click="selectVault('token1')"
            >
              <h3 class="vault-card-title">Token1 Vault</h3>
              <BaseListGrid
                :items="token1VaultData"
                :columns="2"
                size="sm"
                variant="neutral"
                :clickable="false"
                :hover="false"
              />
            </div>

            <!-- Token2 Vault Card -->
            <div 
              class="vault-card vault-card-hover"
              :class="{ 'vault-card-selected': selectedVault === 'token2' }"
              @click="selectVault('token2')"
            >
              <h3 class="vault-card-title">Token2 Vault</h3>
              <BaseListGrid
                :items="token2VaultData"
                :columns="2"
                size="sm"
                variant="neutral"
                :clickable="false"
                :hover="false"
              />
            </div>
          </div>
        </div>

        <!-- Vault Details Section (Right Side - 60%) -->
        <div class="vault-details-section">
          <div class="vault-details-header">
            <h3 class="vault-details-title">Vault Details</h3>
          </div>
          <div class="vault-details-container">
            <div class="details-header">
              <div class="tab-controls">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  :class="['tab-button', { 'tab-active': activeTab === tab.id }]"
                  @click="setActiveTab(tab.id as 'balance' | 'nft' | 'transactions')"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

          <!-- 3 Column Table -->
          <div class="details-table">
            <div class="table-header">
              <div class="col-description">Description</div>
              <div class="col-amount">Amount</div>
              <div class="col-value">$ Value</div>
            </div>
            <div class="table-body">
              <div 
                v-for="item in currentTabData" 
                :key="item.id"
                class="table-row"
              >
                <div class="col-description">{{ item.title }}</div>
                <div class="col-amount">{{ item.subtitle }}</div>
                <div class="col-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseList, BaseListGrid } from '@/components/base'
import { useThemeStore } from '@/stores/themeStore'
import { useDesignTokens } from '@/composables/useDesignTokens'

// Types
interface VaultBalance {
  walletID: string
  vaultID: string
  guildID: string
  tokens: Record<string, number>
  nfts?: Record<string, number>
  lastUpdated: string
}

interface ArmoryBalance {
  walletID: string
  armoryID: string
  guildID: string
  tokens: Record<string, number>
  nfts: Record<string, number>
  lastUpdated: string
}

interface Transaction {
  transactionID: string
  vaultID: string
  solanaBlock: number
  timestamp: string
  sender: string
  receiver: string
  amount: number
  tokenType: string
  dollarValue: number
  description: string
  status: string
}

interface TokenItem {
  id: string
  title: string
  subtitle: string
  value?: string
}

// Theme and design tokens
const themeStore = useThemeStore()
const { borderRadius, spacing } = useDesignTokens()

// State
const guildVaultBalance = ref<VaultBalance | null>(null)
const token1VaultBalance = ref<VaultBalance | null>(null)
const token2VaultBalance = ref<VaultBalance | null>(null)
const incomeVaultBalance = ref<VaultBalance | null>(null)
const armoryBalance = ref<ArmoryBalance | null>(null)
const transactions = ref<Transaction[]>([])

// Selection state
const selectedVault = ref<string | null>(null)
const activeTab = ref<'balance' | 'nft' | 'transactions'>('balance')

// Tabs configuration
const tabs = [
  { id: 'balance', label: 'Token' },
  { id: 'nft', label: 'NFT' },
  { id: 'transactions', label: 'Transactions' }
]

// Computed data for vault cards
const guildVaultData = computed(() => {
  if (!guildVaultBalance.value || !armoryBalance.value) return []
  
  const totalTokens = Object.values(guildVaultBalance.value.tokens || {}).reduce((sum: number, val: number) => sum + val, 0)
  const totalArmory = Object.values(armoryBalance.value.tokens || {}).reduce((sum: number, val: number) => sum + val, 0)
  
  return [
    {
      id: 'income-share',
      title: 'Income Share',
      subtitle: '45%'
    },
    {
      id: 'total-balance',
      title: 'Total Balance',
      subtitle: `${totalTokens.toLocaleString()} SOL`
    },
    {
      id: 'total-armory',
      title: 'Total Armory',
      subtitle: `${totalArmory.toLocaleString()} Items`
    },
    {
      id: 'contribution-points',
      title: 'Contribution Points',
      subtitle: '1,250 CP'
    }
  ]
})

const token1VaultData = computed(() => {
  if (!token1VaultBalance.value) return []
  
  const vaultBalance = token1VaultBalance.value.tokens?.['guild-1-token1'] || 0
  const atlasBalance = token1VaultBalance.value.tokens?.atlas || 0
  const exchangeRatio = atlasBalance > 0 ? (vaultBalance / atlasBalance).toFixed(4) : '0.0000'
  
  return [
    {
      id: 'income-share',
      title: 'Income Share',
      subtitle: '25%'
    },
    {
      id: 'exchange-ratio',
      title: 'Exchange Ratio',
      subtitle: `1:${exchangeRatio}`
    },
    {
      id: 'vault-balance',
      title: 'Vault Balance',
      subtitle: `${vaultBalance.toLocaleString()} Tokens`
    },
    {
      id: 'circulating',
      title: 'Circulating',
      subtitle: `${(vaultBalance * 0.75).toLocaleString()} Tokens`
    }
  ]
})

const token2VaultData = computed(() => {
  if (!token2VaultBalance.value) return []
  
  const vaultBalance = token2VaultBalance.value.tokens?.['guild-1-token2'] || 0
  const polisBalance = token2VaultBalance.value.tokens?.polis || 0
  const exchangeRatio = polisBalance > 0 ? (vaultBalance / polisBalance).toFixed(4) : '0.0000'
  
  return [
    {
      id: 'income-share',
      title: 'Income Share',
      subtitle: '30%'
    },
    {
      id: 'exchange-ratio',
      title: 'Exchange Ratio',
      subtitle: `1:${exchangeRatio}`
    },
    {
      id: 'vault-balance',
      title: 'Vault Balance',
      subtitle: `${vaultBalance.toLocaleString()} Tokens`
    },
    {
      id: 'circulating',
      title: 'Circulating',
      subtitle: `${(vaultBalance * 0.60).toLocaleString()} Tokens`
    }
  ]
})

const incomeVaultData = computed(() => {
  if (!incomeVaultBalance.value) return []
  
  const currentBalance = Object.values(incomeVaultBalance.value.tokens || {}).reduce((sum: number, val: number) => sum + val, 0)
  const monthlyAverage = currentBalance * 0.3 // Simulated monthly average
  const totalProcessed = currentBalance * 2.5 // Simulated total processed
  
  return [
    {
      id: 'monthly-overhead',
      title: 'Monthly Overhead',
      subtitle: '2,500 SOL'
    },
    {
      id: 'current-balance',
      title: 'Current Balance',
      subtitle: `${currentBalance.toLocaleString()} SOL`
    },
    {
      id: 'monthly-average',
      title: 'Monthly Average',
      subtitle: `${monthlyAverage.toLocaleString()} SOL`
    },
    {
      id: 'total-processed',
      title: 'Total Processed',
      subtitle: `${totalProcessed.toLocaleString()} SOL`
    }
  ]
})

// Computed properties for tab data - 3 columns: Description, Amount, $ Value
const currentTabData = computed(() => {
  if (activeTab.value === 'balance') {
    return selectedVault.value ? getVaultBalanceData(selectedVault.value) : getAllVaultsBalanceData()
  } else if (activeTab.value === 'nft') {
    return selectedVault.value ? getVaultNFTData(selectedVault.value) : getAllVaultsNFTData()
  } else if (activeTab.value === 'transactions') {
    return selectedVault.value ? getVaultTransactionData(selectedVault.value) : getAllVaultsTransactionData()
  }
  return []
})

// Methods
const selectVault = (vaultType: string) => {
  selectedVault.value = selectedVault.value === vaultType ? null : vaultType
}

const setActiveTab = (tabId: 'balance' | 'nft' | 'transactions') => {
  activeTab.value = tabId
}

const getVaultDisplayName = (vaultType: string) => {
  const names = {
    guild: 'Guild Vault',
    token1: 'Token1 Vault',
    token2: 'Token2 Vault',
    income: 'Income Vault'
  }
  return names[vaultType as keyof typeof names] || vaultType
}


// Data generation methods - 3 columns: Description, Amount, $ Value
const getVaultBalanceData = (vaultType: string) => {
  let vaultData: VaultBalance | null = null
  
  switch (vaultType) {
    case 'guild':
      vaultData = guildVaultBalance.value
      break
    case 'income':
      vaultData = incomeVaultBalance.value
      break
    case 'token1':
      vaultData = token1VaultBalance.value
      break
    case 'token2':
      vaultData = token2VaultBalance.value
      break
  }
  
  if (!vaultData) return []
  
  const items = Object.entries(vaultData.tokens || {}).map(([token, amount], index) => ({
    id: `${vaultType}-${token}-${index}`,
    title: `${token.toUpperCase()} - ${token === 'sol' ? 'Solana' : token === 'usdc' ? 'USD Coin' : token === 'wbtc' ? 'Wrapped Bitcoin' : token === 'atlas' ? 'Star Atlas' : token === 'polis' ? 'Star Atlas Polis' : 'Custom Token'}`,
    subtitle: `${amount.toLocaleString()} ${token.toUpperCase()}`,
    value: `$${(amount * 50).toLocaleString()}`
  }))
  
  // Add total row for tokens
  const total = items.reduce((sum, item) => {
    const value = parseFloat(item.value.replace(/[$,]/g, ''))
    return sum + value
  }, 0)
  
  items.push({
    id: `${vaultType}-total`,
    title: 'TOTAL VALUE',
    subtitle: '',
    value: `$${total.toLocaleString()}`
  })
  
  return items
}

const getAllVaultsBalanceData = () => {
  const allTokens: Record<string, number> = {}
  
  // Combine tokens from all vaults
  const vaults = [guildVaultBalance.value, incomeVaultBalance.value, token1VaultBalance.value, token2VaultBalance.value]
  vaults.forEach(vault => {
    if (vault?.tokens) {
      Object.entries(vault.tokens).forEach(([token, amount]) => {
        allTokens[token] = (allTokens[token] || 0) + amount
      })
    }
  })
  
  const items = Object.entries(allTokens).map(([token, amount], index) => ({
    id: `all-${token}-${index}`,
    title: `${token.toUpperCase()} - ${token === 'sol' ? 'Solana' : token === 'usdc' ? 'USD Coin' : token === 'wbtc' ? 'Wrapped Bitcoin' : token === 'atlas' ? 'Star Atlas' : token === 'polis' ? 'Star Atlas Polis' : 'Custom Token'}`,
    subtitle: `${amount.toLocaleString()} ${token.toUpperCase()}`,
    value: `$${(amount * 50).toLocaleString()}`
  }))
  
  // Add total row
  const total = items.reduce((sum, item) => {
    const value = parseFloat(item.value.replace(/[$,]/g, ''))
    return sum + value
  }, 0)
  
  items.push({
    id: 'all-total',
    title: 'TOTAL VALUE',
    subtitle: '',
    value: `$${total.toLocaleString()}`
  })
  
  return items
}

const getVaultNFTData = (vaultType: string) => {
  let nftData: Record<string, number> = {}
  
  // Only guild, income, and armory can have NFTs
  if (vaultType === 'guild' && guildVaultBalance.value?.nfts) {
    nftData = guildVaultBalance.value.nfts
  } else if (vaultType === 'income' && incomeVaultBalance.value?.nfts) {
    nftData = incomeVaultBalance.value.nfts
  } else if (vaultType === 'guild' && armoryBalance.value?.nfts) {
    nftData = armoryBalance.value.nfts
  }
  
  return Object.entries(nftData).map(([nft, count], index) => ({
    id: `${vaultType}-nft-${index}`,
    title: nft,
    subtitle: `${count} Items`,
    value: `$${(count * 100).toLocaleString()}` // Placeholder NFT pricing
  }))
}

const getAllVaultsNFTData = () => {
  const allNFTs: Record<string, number> = {}
  
  // Combine NFTs from guild, income, and armory
  const nftSources = [
    guildVaultBalance.value?.nfts,
    incomeVaultBalance.value?.nfts,
    armoryBalance.value?.nfts
  ]
  
  nftSources.forEach(nfts => {
    if (nfts) {
      Object.entries(nfts).forEach(([nft, count]) => {
        allNFTs[nft] = (allNFTs[nft] || 0) + count
      })
    }
  })
  
  return Object.entries(allNFTs).map(([nft, count], index) => ({
    id: `all-nft-${index}`,
    title: nft,
    subtitle: `${count} Items`,
    value: `$${(count * 100).toLocaleString()}` // Placeholder NFT pricing
  }))
}

const getVaultTransactionData = (vaultType: string) => {
  // Filter transactions by vaultID
  const vaultTransactions = transactions.value.filter(tx => tx.vaultID === `guild-1_${vaultType}_vault`)
  
  return vaultTransactions.map((tx, index) => ({
    id: `tx-${vaultType}-${index}`,
    title: `${tx.sender.slice(0, 8)}...${tx.receiver.slice(-8)}`,
    subtitle: `${tx.amount} ${tx.tokenType}`,
    value: `$${tx.dollarValue.toLocaleString()}`
  }))
}

const getAllVaultsTransactionData = () => {
  return transactions.value.map((tx, index) => ({
    id: `tx-all-${index}`,
    title: `${tx.sender.slice(0, 8)}...${tx.receiver.slice(-8)}`,
    subtitle: `${tx.amount} ${tx.tokenType}`,
    value: `$${tx.dollarValue.toLocaleString()}`
  }))
}

const fetchVaultData = async () => {
  try {
    // Fetch guild vault balance
    const guildResponse = await fetch('/SLP/balance/guild-1_guild_vault_balance.json')
    guildVaultBalance.value = await guildResponse.json()
    
    // Fetch token1 vault balance
    const token1Response = await fetch('/SLP/balance/guild-1_token1_vault_balance.json')
    token1VaultBalance.value = await token1Response.json()
    
    // Fetch token2 vault balance
    const token2Response = await fetch('/SLP/balance/guild-1_token2_vault_balance.json')
    token2VaultBalance.value = await token2Response.json()
    
    // Fetch income vault balance
    const incomeResponse = await fetch('/SLP/balance/guild-1_income_vault_balance.json')
    incomeVaultBalance.value = await incomeResponse.json()
    
    // Fetch armory balance
    const armoryResponse = await fetch('/SLP/balance/guild-1_armory_balance.json')
    armoryBalance.value = await armoryResponse.json()
    
    // Fetch transaction data
    const transactionsResponse = await fetch('/SLP/guildtransactions/guild-1_vault_transactions.json')
    const transactionsData = await transactionsResponse.json()
    transactions.value = transactionsData.transactions
  } catch (error) {
    console.error('Error fetching vault data:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchVaultData()
})
</script>

<style scoped>
.vaults-page {
  min-height: 100vh;
  background: var(--primary-color-0);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  align-items: center;
}

/* Wide screen margin */
@media (min-width: 1400px) {
  .vaults-page {
    padding: var(--space-xl) 10%;
  }
}

/* Primary header card styling */
.vaults-header {
  width: 100%;
  max-width: 100%;
  border: var(--component-border-width) solid var(--secondary-color-0);
  border-radius: var(--border-radius-lg);
}

/* Add border radius to the top card */
.vaults-header :deep(.base-card) {
  border-radius: var(--border-radius-lg);
}

.header-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-icon {
  font-size: 2.5rem;
  color: var(--text-color-0);
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color-0);
  margin: 0;
}

.header-description {
  font-size: 0.9rem;
  color: var(--text-color-1);
  opacity: 0.8;
  line-height: 1.5;
  margin: 0;
}

/* Main content card */
.main-content-card {
  width: 100%;
  max-width: 100%;
}

/* Main content container for side-by-side layout */
.main-content-container {
  display: flex;
  gap: var(--space-lg);
  align-items: stretch;
  min-height: 0;
  height: 100%;
}

.vaults-container {
  width: 40%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.vaults-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
  min-height: 0;
}

/* Ensure vault selector header aligns with vault details header */
.vault-selector-header {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
  height: fit-content;
}

.vault-card {
  min-width: 0;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: var(--space-sm);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--theme-border-radius-md);
  background: var(--primary-color-0);
}

.vault-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--secondary-color-1);
  margin: 0 0 var(--space-sm) 0;
  text-align: center;
}

/* Vault card hover effect */
.vault-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--secondary-color-1);
  background: var(--secondary-color-3);
}

/* Custom styling for vault grid items */
.vault-card :deep(.grid-item-title) {
  color: var(--text-color-2);
  font-weight: 500;
  text-align: left;
  font-size: 0.75rem;
}

.vault-card :deep(.grid-item-subtitle) {
  color: var(--text-color-0);
  font-weight: 600;
  text-align: left;
  font-size: 0.8rem;
}

/* Remove ALL spacing and hover effects from grid items */
.vault-card :deep(.grid-item) {
  padding: 0 !important;
  margin: 0 !important;
  min-height: auto;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
}

.vault-card :deep(.grid-item:hover) {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Remove gaps between grid items */
.vault-card :deep(.base-list-grid) {
  gap: 0 !important;
}

/* Disable all hover effects on grid */
.vault-card :deep(.base-list-grid.grid-hover .grid-item:hover),
.vault-card :deep(.base-list-grid .item-hover:hover) {
  transform: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* Vault card selection styling */
.vault-card-selected {
  border: var(--border-width-thin) solid var(--secondary-color-0) !important;
  background: var(--primary-color-1) !important;
}

/* Vault details section - 100% height */
.vault-details-section {
  width: 60%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.vault-details-header {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
}

.vault-details-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color-0);
  margin: 0;
}

.vault-details-container {
  flex: 1;
  min-height: 0;
  padding: var(--space-md);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--theme-border-radius-md);
  background: var(--primary-color-0);
  display: flex;
  flex-direction: column;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
}

.details-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color-0);
  margin: 0;
}

.tab-controls {
  display: flex;
  gap: var(--space-sm);
}

.tab-button {
  padding: var(--space-sm) var(--space-md);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  background: var(--primary-color-0);
  color: var(--text-color-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-fast);
}

.tab-button:hover {
  background: var(--primary-color-1);
  border-color: var(--secondary-color-1);
}

.tab-active {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
  border-color: var(--secondary-color-0);
}

/* 3 Column Table - Using Design Tokens */
.details-table {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color-1);
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
  font-weight: var(--font-weight-semibold);
  font-size: 0.8rem;
  color: var(--text-color-0);
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
}

.table-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
  font-size: 0.8rem;
  line-height: var(--line-height-tight);
  transition: var(--transition-fast);
}

.table-row:last-child {
  border-bottom: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
}

.col-description {
  color: var(--text-color-0);
  font-weight: var(--font-weight-medium);
  text-align: left;
}

.col-amount {
  color: var(--text-color-1);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.col-value {
  color: var(--secondary-color-0);
  font-weight: var(--font-weight-bold);
  text-align: right;
}

/* Vault selector header - Using Design Tokens */
.vaults-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color-0);
  margin: 0;
}

.vaults-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-color-1);
  margin: 0;
  opacity: var(--opacity-subtle);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content-container {
    flex-direction: column;
  }
  
  .vaults-container,
  .vault-details-section {
    width: 100%;
  }
  
  .vaults-grid {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .vaults-page {
    padding: var(--space-md);
  }
  
  .main-content-container {
    flex-direction: column;
  }
  
  .vaults-container,
  .vault-details-section {
    width: 100%;
  }
  
  .vaults-grid {
    flex-direction: column;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-description {
    font-size: 1rem;
  }
  
  .vault-details-header {
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }
  
  .tab-controls {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-icon {
    font-size: 2.5rem;
  }
  
  .header-title {
    font-size: 1.75rem;
  }
  
  .tab-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>

