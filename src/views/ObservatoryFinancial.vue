<template>
  <BaseObservatory>
    <div class="observatory-financial-content">
      <!-- Financial Summary -->
      <BaseSummaryObservatory
        title="Financial Summary"
        subtitle="Guild financial overview and key metrics"
        icon="game-icons:coins"
        :key-metrics="financialSummaryMetrics"
        :progress-goals="financialGoals"
        :recent-activity="vaultActions"
        data-type="financial"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @goal-click="handleGoalClick"
        @activity-click="handleActivityClick"
      />

      <!-- Vault Balances -->
      <BaseSummaryObservatory
        title="Vault Balances"
        subtitle="Current vault balances and changes"
        icon="game-icons:treasure-chest"
        :key-metrics="vaultBalanceMetrics"
        :recent-activity="vaultBalances"
        data-type="financial"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Income & Expenses -->
      <BaseSummaryObservatory
        title="Income & Expenses"
        subtitle="Revenue and spending analysis"
        icon="game-icons:wallet"
        :key-metrics="incomeExpenseMetrics"
        :distributions="incomeExpenseDistributions"
        :recent-activity="incomeExpenses"
        data-type="financial"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Token Metrics -->
      <BaseSummaryObservatory
        title="Token Metrics"
        subtitle="Token performance and market data"
        icon="game-icons:gem"
        :key-metrics="tokenMetrics"
        :recent-activity="tokenMetricsList"
        data-type="financial"
        @time-filter-change="handleTimeFilterChange"
        @metric-click="handleMetricClick"
        @activity-click="handleActivityClick"
      />

      <!-- Profit & Loss -->
      <BaseSummaryObservatory
        title="Profit & Loss"
        subtitle="Financial performance over time"
        icon="game-icons:chart"
        :key-metrics="profitLossMetrics"
        :distributions="profitLossDistributions"
        data-type="financial"
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

// Import the financial data
import financialDataJson from '@/../public/SLP/observatory/financial.json'

// State
const financialData = ref(financialDataJson as any)

// Computed properties for different sections
const financialSummaryMetrics = computed(() => [
  {
    id: 'total_assets',
    label: 'Total Assets',
    value: financialData.value.financialSummary.totalAssets.totalValueSOL,
    format: 'currency' as const,
    icon: 'game-icons:treasure-chest'
  },
  {
    id: 'net_worth',
    label: 'Net Worth',
    value: financialData.value.financialSummary.netWorth,
    format: 'currency' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'total_liabilities',
    label: 'Total Liabilities',
    value: financialData.value.financialSummary.totalLiabilities.totalValueSOL,
    format: 'currency' as const,
    icon: 'game-icons:warning'
  },
  {
    id: 'sol_balance',
    label: 'SOL Balance',
    value: financialData.value.financialSummary.totalAssets.sol,
    format: 'currency' as const,
    icon: 'game-icons:gem'
  },
  {
    id: 'guild_coins',
    label: 'Guild Coins',
    value: financialData.value.financialSummary.totalAssets.guildCoins,
    format: 'number' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'nft_count',
    label: 'NFTs',
    value: financialData.value.financialSummary.totalAssets.nfts,
    format: 'number' as const,
    icon: 'game-icons:image'
  }
])

const financialGoals = computed(() => [
  {
    id: 'treasury_goal',
    title: 'Reach 5000 SOL Treasury',
    current: financialData.value.financialGoals[0].current,
    target: financialData.value.financialGoals[0].target,
    progress: financialData.value.financialGoals[0].progress,
    format: 'currency' as const,
    deadline: financialData.value.financialGoals[0].deadline
  },
  {
    id: 'coin_circulation_goal',
    title: 'Achieve 100K Guild Coin Circulation',
    current: financialData.value.financialGoals[1].current,
    target: financialData.value.financialGoals[1].target,
    progress: financialData.value.financialGoals[1].progress,
    format: 'number' as const,
    deadline: financialData.value.financialGoals[1].deadline
  },
  {
    id: 'profit_margin_goal',
    title: 'Maintain 50% Profit Margin',
    current: financialData.value.financialGoals[2].current,
    target: financialData.value.financialGoals[2].target,
    progress: financialData.value.financialGoals[2].progress,
    format: 'percentage' as const,
    deadline: financialData.value.financialGoals[2].deadline
  }
])

const vaultBalanceMetrics = computed(() => [
  {
    id: 'total_vaults',
    label: 'Active Vaults',
    value: financialData.value.summary.activeVaults,
    format: 'number' as const,
    icon: 'game-icons:treasure-chest'
  },
  {
    id: 'total_balance',
    label: 'Total Balance',
    value: financialData.value.vaultBalances.reduce((sum: number, vault: any) => {
      const balance = parseFloat(vault.balance.replace(/[^\d.]/g, ''))
      return sum + balance
    }, 0),
    format: 'currency' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'guild_treasury',
    label: 'Guild Treasury',
    value: parseFloat(financialData.value.vaultBalances[0].balance.replace(/[^\d.]/g, '')),
    format: 'currency' as const,
    icon: 'game-icons:castle'
  },
  {
    id: 'income_vault',
    label: 'Income Vault',
    value: parseFloat(financialData.value.vaultBalances[1].balance.replace(/[^\d.]/g, '')),
    format: 'currency' as const,
    icon: 'game-icons:wallet'
  }
])

const incomeExpenseMetrics = computed(() => [
  {
    id: 'total_revenue',
    label: 'Total Revenue',
    value: financialData.value.summary.totalRevenue,
    format: 'currency' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'total_expenses',
    label: 'Total Expenses',
    value: financialData.value.summary.totalExpenses,
    format: 'currency' as const,
    icon: 'game-icons:warning'
  },
  {
    id: 'net_profit',
    label: 'Net Profit',
    value: financialData.value.summary.netProfit,
    format: 'currency' as const,
    icon: 'game-icons:chart'
  },
  {
    id: 'profit_margin',
    label: 'Profit Margin',
    value: parseFloat(financialData.value.summary.profitMargin),
    format: 'percentage' as const,
    icon: 'game-icons:target'
  }
])

const incomeExpenseDistributions = computed(() => [
  {
    id: 'income_sources',
    title: 'Income Sources',
    items: financialData.value.income.map((income: any) => ({
      key: income.id,
      label: income.source,
      value: parseFloat(income.amount.replace(/[^\d.]/g, '')),
      percentage: (parseFloat(income.amount.replace(/[^\d.]/g, '')) / parseFloat(financialData.value.summary.totalRevenue)) * 100
    }))
  },
  {
    id: 'expense_categories',
    title: 'Expense Categories',
    items: financialData.value.expenses.map((expense: any) => ({
      key: expense.id,
      label: expense.category,
      value: parseFloat(expense.amount.replace(/[^\d.]/g, '')),
      percentage: (parseFloat(expense.amount.replace(/[^\d.]/g, '')) / parseFloat(financialData.value.summary.totalExpenses)) * 100
    }))
  }
])

const tokenMetrics = computed(() => [
  {
    id: 'token_types',
    label: 'Token Types',
    value: financialData.value.summary.tokenTypes,
    format: 'number' as const,
    icon: 'game-icons:gem'
  },
  {
    id: 'guild_coin_price',
    label: 'Guild Coin Price',
    value: parseFloat(financialData.value.tokenMetrics[0].price),
    format: 'currency' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'market_cap',
    label: 'Market Cap',
    value: parseFloat(financialData.value.tokenMetrics[0].marketCap),
    format: 'currency' as const,
    icon: 'game-icons:chart'
  },
  {
    id: 'circulating_supply',
    label: 'Circulating Supply',
    value: financialData.value.tokenMetrics[0].circulatingSupply,
    format: 'number' as const,
    icon: 'game-icons:coins'
  }
])

const profitLossMetrics = computed(() => [
  {
    id: 'last_7d_income',
    label: '7d Income',
    value: parseFloat(financialData.value.profitLoss.last7Days.totalIncome),
    format: 'currency' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'last_7d_expenses',
    label: '7d Expenses',
    value: parseFloat(financialData.value.profitLoss.last7Days.totalExpenses),
    format: 'currency' as const,
    icon: 'game-icons:warning'
  },
  {
    id: 'last_7d_profit',
    label: '7d Profit',
    value: parseFloat(financialData.value.profitLoss.last7Days.netProfit),
    format: 'currency' as const,
    icon: 'game-icons:chart'
  },
  {
    id: 'last_7d_margin',
    label: '7d Margin',
    value: parseFloat(financialData.value.profitLoss.last7Days.profitMargin),
    format: 'percentage' as const,
    icon: 'game-icons:target'
  },
  {
    id: 'last_30d_income',
    label: '30d Income',
    value: parseFloat(financialData.value.profitLoss.last30Days.totalIncome),
    format: 'currency' as const,
    icon: 'game-icons:coins'
  },
  {
    id: 'last_30d_profit',
    label: '30d Profit',
    value: parseFloat(financialData.value.profitLoss.last30Days.netProfit),
    format: 'currency' as const,
    icon: 'game-icons:chart'
  }
])

const profitLossDistributions = computed(() => [
  {
    id: 'time_periods',
    title: 'Performance by Period',
    items: [
      {
        key: '7d',
        label: 'Last 7 Days',
        value: parseFloat(financialData.value.profitLoss.last7Days.netProfit),
        percentage: 100
      },
      {
        key: '30d',
        label: 'Last 30 Days',
        value: parseFloat(financialData.value.profitLoss.last30Days.netProfit),
        percentage: (parseFloat(financialData.value.profitLoss.last30Days.netProfit) / parseFloat(financialData.value.profitLoss.last7Days.netProfit)) * 100
      }
    ]
  }
])

// Convert data to activity format
const vaultActions = computed(() => 
  financialData.value.vaultActions.map((action: any) => ({
    id: action.id,
    title: `${action.action.charAt(0).toUpperCase() + action.action.slice(1)} - ${action.vaultName}`,
    description: action.source || action.purpose || 'Vault operation',
    amount: action.amount,
    timestamp: action.timestamp,
    status: action.action === 'deposit' ? 'success' : 'info'
  }))
)

const vaultBalances = computed(() => 
  financialData.value.vaultBalances.map((vault: any) => ({
    id: vault.vaultName.toLowerCase().replace(/\s+/g, '_'),
    title: vault.vaultName,
    description: `Balance: ${vault.balance}`,
    amount: vault.change24h,
    timestamp: vault.lastUpdated,
    status: vault.change24h.startsWith('+') ? 'success' : 'warning'
  }))
)

const incomeExpenses = computed(() => [
  ...financialData.value.income.map((income: any) => ({
    id: income.id,
    title: `Income: ${income.source}`,
    description: `Period: ${income.period}`,
    amount: income.amount,
    timestamp: income.timestamp,
    status: 'success'
  })),
  ...financialData.value.expenses.map((expense: any) => ({
    id: expense.id,
    title: `Expense: ${expense.category}`,
    description: `Period: ${expense.period}`,
    amount: expense.amount,
    timestamp: expense.timestamp,
    status: 'warning'
  }))
])

const tokenMetricsList = computed(() => 
  financialData.value.tokenMetrics.map((token: any) => ({
    id: token.tokenName.toLowerCase().replace(/\s+/g, '_'),
    title: token.tokenName,
    description: `Price: ${token.price} | Market Cap: ${token.marketCap}`,
    amount: `${token.change24h} (24h)`,
    timestamp: new Date().toISOString(),
    status: token.change24h.startsWith('+') ? 'success' : 'warning'
  }))
)

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
  console.log('Financial Observatory loaded with data:', financialData.value)
})
</script>

<style scoped>
.observatory-financial-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Responsive */
@media (max-width: 768px) {
  .observatory-financial-content {
    gap: var(--space-lg);
  }
}
</style>