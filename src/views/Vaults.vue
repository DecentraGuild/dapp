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
            <h1 class="header-title">Guild Vaults - Version 1</h1>
          </div>
          <p class="header-description">
            Manage and monitor your guild's treasury, token vaults, and income streams. 
            Track balances, exchange rates, and contribution metrics across all vault systems.
          </p>
        </div>
      </template>
    </BaseCard>

    <!-- Vault Cards Container -->
    <BaseCard 
      variant="neutral" 
      size="lg" 
      class="vaults-container"
    >
      <div class="vaults-grid">
        <!-- Income Vault Card -->
        <BaseList
          :items="incomeVaultData"
          title="Income Vault"
          variant="default"
          size="md"
          :clickable="false"
          class="vault-card vault-card-hover"
          :class="{ 'vault-card-selected': selectedVault === 'income' }"
          @click="selectVault('income')"
        />

        <!-- Guild Vault Card -->
        <BaseList
          :items="guildVaultData"
          title="Guild Vault"
          variant="default"
          size="md"
          :clickable="false"
          class="vault-card vault-card-hover"
          :class="{ 'vault-card-selected': selectedVault === 'guild' }"
          @click="selectVault('guild')"
        />

        <!-- Token1 Vault Card -->
        <BaseList
          :items="token1VaultData"
          title="Token1 Vault"
          variant="default"
          size="md"
          :clickable="false"
          class="vault-card vault-card-hover"
          :class="{ 'vault-card-selected': selectedVault === 'token1' }"
          @click="selectVault('token1')"
        />

        <!-- Token2 Vault Card -->
        <BaseList
          :items="token2VaultData"
          title="Token2 Vault"
          variant="default"
          size="md"
          :clickable="false"
          class="vault-card vault-card-hover"
          :class="{ 'vault-card-selected': selectedVault === 'token2' }"
          @click="selectVault('token2')"
        />
      </div>
    </BaseCard>

    <!-- Vault Details Section -->
    <BaseCard 
      variant="neutral" 
      size="lg" 
      class="vault-details-container"
    >
      <div class="vault-details-header">
        <h3 class="details-title">
          {{ selectedVault ? `${getVaultDisplayName(selectedVault)} Details` : 'All Vaults Overview' }}
        </h3>
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

      <!-- Tab Content -->
      <div v-if="activeTab === 'balance'" class="token-details-container">
        <div class="token-list">
          <div 
            v-for="item in currentTokenData" 
            :key="item.id"
            class="token-row"
          >
            <div class="token-name">{{ item.title }}</div>
            <div class="token-amount">{{ item.subtitle }}</div>
            <div class="token-value">{{ item.value || '' }}</div>
          </div>
        </div>
        <div class="token-total">
          <div class="total-label">Total Value</div>
          <div class="total-amount">{{ getTotalValue() }}</div>
        </div>
      </div>
      <BaseList
        v-else
        :items="currentTabData"
        :variant="'hover'"
        size="md"
        class="vault-details-list"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseList } from '@/components/base'
import { useThemeStore } from '@/stores/themeStore'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { getSlpPath } from '@/utils/api'
import { usePriceStore } from '@/stores/priceStore'

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

// Price store
const priceStore = usePriceStore()

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
  if (!guildVaultBalance.value) return []
  
  const totalTokens = Object.values(guildVaultBalance.value.tokens || {}).reduce((sum: number, val: number) => sum + val, 0)
  const totalArmory = armoryBalance.value ? Object.values(armoryBalance.value.tokens || {}).reduce((sum: number, val: number) => sum + val, 0) : 0
  
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
  
  const atlasBalance = token1VaultBalance.value.tokens?.atlas || 0
  const circulatingSupply = token1VaultBalance.value.circulatingSupply || 0
  const exchangeRatio = token1VaultBalance.value.exchangeRatio || [1, 100]
  const exchangeRatioText = `${exchangeRatio[0]}:${exchangeRatio[1]}`
  
  return [
    {
      id: 'income-share',
      title: 'Income Share',
      subtitle: '25%'
    },
    {
      id: 'exchange-ratio',
      title: 'Exchange Ratio',
      subtitle: exchangeRatioText
    },
    {
      id: 'vault-balance',
      title: 'Vault Balance',
      subtitle: `${atlasBalance.toLocaleString()} ATLAS`
    },
    {
      id: 'circulating',
      title: 'Circulating',
      subtitle: `${circulatingSupply.toLocaleString()} Tokens`
    }
  ]
})

const token2VaultData = computed(() => {
  if (!token2VaultBalance.value) return []
  
  const polisBalance = token2VaultBalance.value.tokens?.polis || 0
  const circulatingSupply = token2VaultBalance.value.circulatingSupply || 0
  const exchangeRatio = token2VaultBalance.value.exchangeRatio || [1, 1.33]
  const exchangeRatioText = `${exchangeRatio[0]}:${exchangeRatio[1]}`
  
  return [
    {
      id: 'income-share',
      title: 'Income Share',
      subtitle: '30%'
    },
    {
      id: 'exchange-ratio',
      title: 'Exchange Ratio',
      subtitle: exchangeRatioText
    },
    {
      id: 'vault-balance',
      title: 'Vault Balance',
      subtitle: `${polisBalance.toLocaleString()} POLIS`
    },
    {
      id: 'circulating',
      title: 'Circulating',
      subtitle: `${circulatingSupply.toLocaleString()} Tokens`
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

// Computed properties for tab data
const currentTabData = computed(() => {
  console.log('Vaults: Computing tab data, priceData available:', !!priceStore.priceData)
  if (activeTab.value === 'balance') {
    return selectedVault.value ? getVaultBalanceData(selectedVault.value) : getAllVaultsBalanceData()
  } else if (activeTab.value === 'nft') {
    return selectedVault.value ? getVaultNFTData(selectedVault.value) : getAllVaultsNFTData()
  } else if (activeTab.value === 'transactions') {
    return selectedVault.value ? getVaultTransactionData(selectedVault.value) : getAllVaultsTransactionData()
  }
  return []
})

// Computed property for token data specifically
const currentTokenData = computed(() => {
  if (activeTab.value === 'balance') {
    return selectedVault.value ? getVaultBalanceData(selectedVault.value) : getAllVaultsBalanceData()
  }
  return []
})

// Helper function to get token price
const getTokenPrice = (token: string): number => {
  const prices = priceStore.priceData
  if (!prices) {
    console.log('PriceStore: No price data available')
    return 0
  }
  
  // Access the actual price data from the Vue ref
  const priceData = prices.value || prices
  console.log('PriceStore: Available prices:', priceData)
  
  // Map token names to pricelist keys
  const tokenMap: Record<string, string> = {
    'sol': 'SOL',
    'usdc': 'USDC',
    'wbtc': 'WBTC',
    'atlas': 'ATLAS',
    'polis': 'POLIS',
    'maxhog': 'MAXHOG',
    'opaljet': 'OPALJET',
    'pearcer6': 'PEARCER6',
    'pearcex4': 'PEARCEX4',
    'pearcex5': 'PEARCEX5',
    'pearcex6': 'PEARCEX6',
    'pearcer8': 'PEARCER8',
    'rainbowchi': 'RAINBOWCHI',
    'rainbowom': 'RAINBOWOM',
    'tufafeist': 'TUFAFEIST',
    'vzusambwe': 'VZUSAMBWE',
    'vzuballad': 'VZUSBALLAD',
    'vzusopod': 'VZUSOPOD',
    'vzussolos': 'VZUSSOLOS',
    'nitro': 'NITRO'
  }
  
  const priceKey = tokenMap[token.toLowerCase()]
  const price = priceKey ? (priceData.value?.[priceKey] || 0) : 0
  
  console.log(`Token: ${token} -> PriceKey: ${priceKey} -> Price: ${price}`)
  return price
}

// Helper function to get NFT price
const getNFTPrice = (nftName: string): number => {
  const prices = priceStore.priceData
  if (!prices) return 0
  
  // Access the actual price data from the Vue ref
  return prices.value?.[nftName] || 0
}

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

const getTotalValue = () => {
  if (activeTab.value !== 'balance') return ''
  
  const total = currentTokenData.value.reduce((sum: number, item: TokenItem) => {
    const value = item.value?.replace(/[$,]/g, '') || '0'
    return sum + parseFloat(value)
  }, 0)
  
  return `$${total.toLocaleString()}`
}

// Data generation methods
const getVaultBalanceData = (vaultType: string): TokenItem[] => {
  console.log(`Vaults: Getting vault balance data for ${vaultType}`)
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
  
  if (!vaultData) {
    console.log(`Vaults: No vault data for ${vaultType}`)
    return []
  }
  
  console.log(`Vaults: Processing tokens for ${vaultType}:`, vaultData.tokens)
  
  return Object.entries(vaultData.tokens || {}).map(([token, amount], index) => {
    const price = getTokenPrice(token)
    const totalValue = amount * price
    console.log(`Vaults: ${token} - amount: ${amount}, price: ${price}, total: ${totalValue}`)
    return {
      id: `${vaultType}-${token}-${index}`,
      title: token.toUpperCase(),
      subtitle: `${amount.toLocaleString()} ${token.toUpperCase()}`,
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  })
}

const getAllVaultsBalanceData = (): TokenItem[] => {
  console.log('Vaults: Getting all vaults balance data')
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
  
  console.log('Vaults: Combined tokens:', allTokens)
  
  return Object.entries(allTokens).map(([token, amount], index) => {
    const price = getTokenPrice(token)
    const totalValue = amount * price
    console.log(`Vaults: ${token} - amount: ${amount}, price: ${price}, total: ${totalValue}`)
    return {
      id: `all-${token}-${index}`,
      title: token.toUpperCase(),
      subtitle: `${amount.toLocaleString()} ${token.toUpperCase()}`,
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  })
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
  
  return Object.entries(nftData).map(([nft, count], index) => {
    const price = getNFTPrice(nft)
    const totalValue = count * price
    return {
      id: `${vaultType}-nft-${index}`,
      title: nft,
      subtitle: `${count} Items`,
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  })
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
  
  return Object.entries(allNFTs).map(([nft, count], index) => {
    const price = getNFTPrice(nft)
    const totalValue = count * price
    return {
      id: `all-nft-${index}`,
      title: nft,
      subtitle: `${count} Items`,
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  })
}

const getVaultTransactionData = (vaultType: string) => {
  // Filter transactions by vaultID
  const vaultTransactions = transactions.value.filter(tx => tx.vaultID === `guild-1_${vaultType}_vault`)
  
  return vaultTransactions.map((tx, index) => ({
    id: `tx-${vaultType}-${index}`,
    title: `${tx.sender.slice(0, 8)}...${tx.receiver.slice(-8)}`,
    subtitle: `${tx.amount} ${tx.tokenType} - ${new Date(tx.timestamp).toLocaleDateString()}`
  }))
}

const getAllVaultsTransactionData = () => {
  return transactions.value.map((tx, index) => ({
    id: `tx-all-${index}`,
    title: `${tx.sender.slice(0, 8)}...${tx.receiver.slice(-8)}`,
    subtitle: `${tx.amount} ${tx.tokenType} - ${new Date(tx.timestamp).toLocaleDateString()}`
  }))
}

const fetchVaultData = async () => {
  try {
    // Fetch guild vault balance
    const guildResponse = await fetch(getSlpPath('balance/guild-1_guild_vault_balance.json'))
    if (guildResponse.ok) {
      guildVaultBalance.value = await guildResponse.json()
    }
    
    // Fetch token1 vault balance
    const token1Response = await fetch(getSlpPath('balance/guild-1_token1_vault_balance.json'))
    if (token1Response.ok) {
      token1VaultBalance.value = await token1Response.json()
    }
    
    // Fetch token2 vault balance
    const token2Response = await fetch(getSlpPath('balance/guild-1_token2_vault_balance.json'))
    if (token2Response.ok) {
      token2VaultBalance.value = await token2Response.json()
    }
    
    // Fetch income vault balance
    const incomeResponse = await fetch(getSlpPath('balance/guild-1_income_vault_balance.json'))
    if (incomeResponse.ok) {
      incomeVaultBalance.value = await incomeResponse.json()
    }
    
    // Fetch armory balance
    const armoryResponse = await fetch(getSlpPath('balance/guild-1_armory_balance.json'))
    if (armoryResponse.ok) {
      armoryBalance.value = await armoryResponse.json()
    }
    
    // Fetch transaction data
    const transactionsResponse = await fetch(getSlpPath('guildtransactions/guild-1_vault_transactions.json'))
    const transactionsData = await transactionsResponse.json()
    transactions.value = transactionsData.transactions
  } catch (error) {
    console.error('Error fetching vault data:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await priceStore.initialize()
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

.vaults-header {
  width: 100%;
  max-width: 100%;
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

.vaults-container {
  width: 100%;
  max-width: 100%;
}

.vaults-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.vault-card {
  min-width: 0;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Vault card hover effect */
.vault-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--secondary-color-1);
  background: var(--secondary-color-3);
}

/* Custom styling for vault list items - Match VaultV2 colors */
.vault-card :deep(.list-item-title) {
  color: var(--secondary-color-1);
  font-weight: 500;
  text-align: left;
  font-size: 0.75rem;
}

.vault-card :deep(.list-item-subtitle) {
  color: var(--text-color-3);
  font-weight: 600;
  text-align: left;
  font-size: 0.8rem;
}

/* Remove individual item hover effects */
.vault-card :deep(.list-item:hover) {
  background: transparent !important;
}

/* Vault card selection styling */
.vault-card-selected {
  border: var(--border-width-thin) solid var(--secondary-color-0) !important;
  background: var(--primary-color-1) !important;
}

/* Vault details section */
.vault-details-container {
  width: 70%;
}

.vault-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.details-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color-0);
  margin: 0;
}

.tab-controls {
  display: flex;
  gap: var(--space-sm);
}

.tab-button {
  padding: 0.5rem 1rem;
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--theme-border-radius-md);
  background: var(--primary-color-0);
  color: var(--text-color-1);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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

.vault-details-list {
  margin-top: var(--space-md);
}

/* Token details styling */
.token-details-container {
  margin-top: var(--space-md);
}

.token-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.token-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-sm);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--theme-border-radius-md);
  background: var(--primary-color-0);
  transition: all 0.2s ease;
}

.token-row:hover {
  background: var(--secondary-color-2);
  border-color: var(--secondary-color-1);
}

.token-name {
  color: var(--text-color-0);
  font-weight: 500;
  font-size: 0.875rem;
}

.token-amount {
  color: var(--text-color-0);
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
}

.token-value {
  color: var(--text-color-1);
  font-weight: 600;
  font-size: 0.875rem;
  text-align: right;
}

.token-total {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-md);
  border: var(--border-width-thin) solid var(--secondary-color-0);
  border-radius: var(--theme-border-radius-lg);
  background: var(--primary-color-0);
  margin-top: var(--space-sm);
}

.total-label {
  color: var(--text-color-1);
  font-weight: 600;
  font-size: 1rem;
}

.total-amount {
  color: var(--text-color-2);
  font-weight: 700;
  font-size: 1.125rem;
  text-align: right;
  grid-column: 3;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .vaults-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .vaults-page {
    padding: var(--space-md);
  }
  
  .vaults-grid {
    grid-template-columns: 1fr;
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
