import { ref, computed, readonly } from 'vue'
import { getSlpPath } from '@/utils/api'

// Simple price list type - just ticker and price
type PriceList = Record<string, number>

// Store state
const priceData = ref<PriceList | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Price calculation functions
const getTokenPrice = (symbol: string): number => {
  if (!priceData.value) return 0
  return priceData.value[symbol] || 0
}

// Calculate total value of a balance object
const calculateBalanceValue = (balance: Record<string, number>): number => {
  let totalValue = 0
  
  for (const [asset, amount] of Object.entries(balance)) {
    const price = getTokenPrice(asset)
    totalValue += amount * price
  }
  
  return totalValue
}

// Format price for display
const formatPrice = (price: number, decimals: number = 2): string => {
  if (price === 0) return '$0.00'
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  if (price < 100) return `$${price.toFixed(2)}`
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

// Format change percentage
const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

// Load price data
const loadPriceData = async (): Promise<void> => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await fetch(getSlpPath('pricelist/pricelist.json'))
    if (!response.ok) {
      throw new Error(`Failed to load price data: ${response.statusText}`)
    }
    
    const data = await response.json()
    priceData.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load price data'
    console.error('Error loading price data:', err)
  } finally {
    isLoading.value = false
  }
}

// Initialize store
const initialize = async (): Promise<void> => {
  await loadPriceData()
}

// Export store
export const usePriceStore = () => {
  return {
    // State
    priceData: readonly(priceData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Methods
    getTokenPrice,
    calculateBalanceValue,
    formatPrice,
    formatChange,
    loadPriceData,
    initialize
  }
}

// Auto-initialize when store is imported
initialize()
