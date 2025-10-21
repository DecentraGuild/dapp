<template>
  <BaseFoundry>
    <div class="foundry-custom-content">
      <!-- Sidebar with Custom Type Links -->
      <BaseSidebar
        :items="customTypeItems"
        variant="primary"
        position="left"
        width="4rem"
        @item-click="handleCustomTypeClick"
      />

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Custom Type Info Card - FULL WIDTH -->
        <div v-if="selectedCustomType" class="custom-type-info-card">
          <div class="custom-type-header">
            <div class="custom-type-icon">
              <Icon :icon="selectedCustomType.icon" class="type-icon" />
            </div>
            <div class="custom-type-details">
              <h2 class="custom-type-name">{{ selectedCustomType.name }}</h2>
              <p class="custom-type-description">{{ selectedCustomType.description }}</p>
            </div>
          </div>
        </div>

        <!-- Custom Assets Grid Container -->
        <BaseCard 
          v-if="selectedCustomType"
          variant="neutral" 
          size="xl"
          class="custom-assets-container"
        >
          <!-- Custom Assets Grid Header -->
          <div class="custom-assets-header">
            <h3 class="grid-title">Available Assets</h3>
            <div class="grid-controls">
              <BaseButton
                variant="outline"
                size="sm"
                icon="mdi:view-grid"
                @click="setGridView('grid')"
              >
                Grid
              </BaseButton>
              <BaseButton
                variant="outline"
                size="sm"
                icon="mdi:view-list"
                @click="setGridView('list')"
              >
                List
              </BaseButton>
            </div>
          </div>
          
          <!-- Custom Assets Grid -->
          <div class="custom-assets-grid">
            <div 
              v-for="(item, index) in customAssetItems" 
              :key="item.id || index"
              :class="['custom-asset-card', { 'custom-asset-card--selected': item.isSelected }]"
              @click="handleAssetClick(item)"
            >
              <!-- Asset Image -->
              <div class="custom-asset-card-image">
                <img 
                  :src="item.icon" 
                  :alt="item.title"
                  class="custom-asset-image"
                />
              </div>
              
              <!-- Asset Content -->
              <div class="custom-asset-card-content">
                <div class="custom-asset-card-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Selected Asset Details Card -->
        <BaseCard 
          v-if="selectedAsset"
          ref="assetDetailsCardRef"
          variant="primary" 
          size="lg"
          class="asset-details-card"
        >
          <div class="asset-details-header">
            <div class="asset-image-container">
              <img 
                :src="getAssetImage(selectedAsset)" 
                :alt="selectedAsset.name"
                class="asset-large-image"
              />
            </div>
            <div class="asset-info">
              <h3 class="asset-name">{{ selectedAsset.name }}</h3>
              <p class="asset-description">{{ selectedAsset.description }}</p>
              <div class="asset-details">
                <div class="detail-item">
                  <span class="detail-label">Exchange Rate:</span>
                  <span class="detail-value">{{ selectedAsset.exchangeRatio[1] }} : {{ selectedAsset.exchangeRatio[0] }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Vault Balance:</span>
                  <span class="detail-value">{{ selectedAsset.vaultBalance }}</span>
                </div>
              </div>
              
              <!-- Calculation Results -->
              <div class="calculation-section">
                <h4 class="calculation-title">Exchange Calculation</h4>
                <BaseList
                  :items="calculationItems"
                  variant="hover"
                  size="sm"
                />
              </div>

              <!-- Exchange Input Section -->
              <div class="exchange-section">
                <div class="input-group">
                  <label class="input-label">Amount to Exchange</label>
                  <div class="input-with-help">
                    <span class="input-help-text">{{ getHelpText() }}</span>
                    <input 
                      v-model="exchangeAmount"
                      type="number"
                      class="amount-input"
                      :placeholder="getInputPlaceholder()"
                      :max="selectedAsset.vaultBalance"
                    />
                  </div>
                </div>
                <BaseButton
                  variant="accent"
                  size="lg"
                  :icon="exchangeAmount < 0 ? 'mdi:arrow-down' : 'mdi:arrow-up'"
                  @click="handleExchange"
                  :disabled="!canExchange"
                  :data-tutorial="selectedAsset?.wrapperID === 'g1-rainbowchi-wrapper' && exchangeAmount > 0 ? 'redeem-chi' : undefined"
                >
                  {{ exchangeAmount < 0 ? 'Create Parts' : 'Redeem' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Success Popup -->
    <BaseSuccessPopup
      :is-visible="showSuccessPopup"
      :title="successPopupData.title"
      :message="successPopupData.message"
      :details="successPopupData.details"
      @close="closeSuccessPopup"
    />
  </BaseFoundry>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFoundry from '@/components/BaseFoundry.vue'
import { BaseCard, BaseButton, BaseListGrid, BaseList } from '@/components/base'
import BaseSidebar from '@/components/base/BaseSidebar.vue'
import BaseSuccessPopup from '@/components/base/BaseSuccessPopup.vue'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { useTutorialStore } from '@/stores/tutorialStore'
import { getSlpPath } from '@/utils/api'
import type { SidebarItem } from '@/components/base/BaseSidebar'

// Types
interface CustomType {
  typeID: string
  name: string
  description: string
  icon: string
  image: string
  isActive: boolean
}

interface CustomAsset {
  wrapperID: string
  guildID: string
  name: string
  symbol: string
  description: string
  image: string
  type: string
  decimals: number
  circulatingSupply: number
  vaultBalance: number
  exchangeRatio: [number, number]
  mintFee: number
  feeToken: string
  mintMember: boolean
  burnMember: boolean
  mintAdmin: boolean
  burnAdmin: boolean
  redemptionAsset: string
  createdAt: string
  isActive: boolean
  contractAddress: string
  backingAsset: {
    resourceID: string
    name: string
    image: string
    type: string
    rarity: string
  }
}

interface AssetItem {
  id: string
  icon: string
  title: string
  subtitle: string
  value: string
  description: string
  assetData: CustomAsset
  isSelected?: boolean
}

// Composables
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()
const tutorialStore = useTutorialStore()

// State
const selectedCustomType = ref<CustomType | null>(null)
const selectedAsset = ref<CustomAsset | null>(null)
const customTypes = ref<CustomType[]>([])
const customAssets = ref<CustomAsset[]>([])
const gridView = ref<'grid' | 'list'>('grid')
const exchangeAmount = ref<number>(0)
const assetDetailsCardRef = ref<InstanceType<typeof BaseCard> | null>(null)

// Success popup state
const showSuccessPopup = ref(false)
const successPopupData = ref({
  title: '',
  message: '',
  details: {} as Record<string, string | number>
})

// Computed
const customTypeItems = computed((): SidebarItem[] => {
  return customTypes.value.map(type => {
    return {
      id: type.typeID,
      icon: type.icon,
      title: type.name.toUpperCase(),
      active: selectedCustomType.value?.typeID === type.typeID
    }
  })
})

const customAssetItems = computed((): AssetItem[] => {
  if (!selectedCustomType.value) {
    return []
  }
  
  const filteredAssets = customAssets.value.filter(asset => 
    asset.type === selectedCustomType.value?.typeID
  )
  
  return filteredAssets.map(asset => ({
    id: asset.wrapperID,
    icon: getAssetImage(asset),
    title: asset.name,
    subtitle: '',
    value: '',
    description: '',
    assetData: asset,
    isSelected: selectedAsset.value?.wrapperID === asset.wrapperID
  }))
})


const calculationItems = computed(() => {
  if (!selectedAsset.value) return []

  const isRedeeming = exchangeAmount.value < 0
  const assetName = selectedAsset.value.backingAsset.name
  const tokenName = selectedAsset.value.symbol
  const absAmount = Math.abs(exchangeAmount.value || 0)

  return [
    {
      id: 'amount',
      icon: 'mdi:counter',
      title: 'Amount Receiving',
      subtitle: `${absAmount} ${assetName}`
    },
    {
      id: 'rate',
      icon: 'mdi:swap-horizontal',
      title: 'Exchange Rate',
      subtitle: `${selectedAsset.value.exchangeRatio[1]} ${tokenName} : ${selectedAsset.value.exchangeRatio[0]} ${assetName}`
    },
    {
      id: 'fee',
      icon: 'mdi:percent',
      title: 'Minting Fee',
      subtitle: `${mintingFee.value.toFixed(4)} SOL`
    },
    {
      id: 'total',
      icon: 'mdi:calculator',
      title: 'Amount Paying',
      subtitle: `${totalCost.value.toFixed(4)} ${tokenName}`
    }
  ]
})

const mintingFee = computed(() => {
  if (!selectedAsset.value) return 0
  return exchangeAmount.value * 0.01 // 1% fee
})

const totalCost = computed(() => {
  if (!selectedAsset.value || !exchangeAmount.value) return 0
  
  const isRedeeming = exchangeAmount.value < 0
  const absAmount = Math.abs(exchangeAmount.value)
  
  // Input is always redemption asset amount
  // Calculate how many wrapper tokens are needed
  const tokenCost = (absAmount * selectedAsset.value.exchangeRatio[1]) / selectedAsset.value.exchangeRatio[0]
  return tokenCost
})

const canExchange = computed(() => {
  if (!selectedAsset.value || !exchangeAmount.value) return false
  
  const isRedeeming = exchangeAmount.value < 0
  const absAmount = Math.abs(exchangeAmount.value)
  
  // Calculate required tokens for the redemption asset amount
  const requiredTokens = (absAmount * selectedAsset.value.exchangeRatio[1]) / selectedAsset.value.exchangeRatio[0]
  
  if (isRedeeming) {
    // Check if user can burn/redeem and has enough tokens
    return selectedAsset.value.burnMember && requiredTokens <= (selectedAsset.value.circulatingSupply || 0)
  } else {
    // Check if user can mint and vault has enough assets
    return selectedAsset.value.mintMember && absAmount <= (selectedAsset.value.vaultBalance || 0)
  }
})

// Methods
const getInputPlaceholder = () => {
  if (!selectedAsset.value) return "Enter amount"
  
  const assetName = selectedAsset.value.backingAsset.name
  return `Enter ${assetName} amount (+redeem, -create)`
}

const getHelpText = () => {
  if (!selectedAsset.value) return "(Positive = Redeem, Negative = Create)"
  
  const assetName = selectedAsset.value.backingAsset.name
  return `(Positive = Redeem ${assetName}, Negative = Create ${assetName} parts)`
}

const loadCustomTypes = async () => {
  try {
    const response = await fetch(getSlpPath('customtypes/guild-1_custom-types.json'))
    if (response.ok) {
      const data = await response.json()
      customTypes.value = data.customTypes
      
      // Select first type by default
      if (data.customTypes.length > 0) {
        selectedCustomType.value = data.customTypes[0]
      }
    }
  } catch (error) {
    // Handle error silently in production
    // Could implement proper error handling/notification system here
  }
}

const loadCustomAssets = async () => {
  try {
    const assetFiles = [
      'guild-1_maxhog-wrapper.json',
      'guild-1_opaljet-wrapper.json',
      'guild-1_rainbowarc-wrapper.json',
      'guild-1_rainbowchi-wrapper.json',
      'guild-1_rainbowom-wrapper.json',
      'guild-1_tufafeist-wrapper.json',
      'guild-1_vzusambwe-wrapper.json',
      'guild-1_vzusballad-wrapper.json',
      'guild-1_vzusopod-wrapper.json',
      'guild-1_vzussolos-wrapper.json'
    ]
    
    const loadedAssets: CustomAsset[] = []
    
    for (const file of assetFiles) {
      const response = await fetch(getSlpPath(`customtokens/${file}`))
      if (response.ok) {
        const asset = await response.json()
        loadedAssets.push(asset)
      }
    }
    
    customAssets.value = loadedAssets
  } catch (error) {
    // Handle error silently in production
    // Could implement proper error handling/notification system here
  }
}

const getAssetImage = (asset: CustomAsset): string => {
  return asset.image.startsWith('http') 
    ? asset.image 
    : getSlpPath(`resources/${asset.image}`)
}

const handleCustomTypeClick = (item: SidebarItem) => {
  const customType = customTypes.value.find(t => t.typeID === item.id)
  if (customType) {
    selectedCustomType.value = customType
    selectedAsset.value = null // Clear selected asset when switching types
  }
}

const handleAssetClick = async (item: any) => {
  selectedAsset.value = item.assetData
  exchangeAmount.value = 0 // Reset exchange amount
  
  // Scroll to asset details after DOM update
  await nextTick()
  scrollToAssetDetails()
}

const scrollToAssetDetails = () => {
  if (assetDetailsCardRef.value && assetDetailsCardRef.value.$el) {
    assetDetailsCardRef.value.$el.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

const closeSuccessPopup = () => {
  showSuccessPopup.value = false
}

const setGridView = (view: 'grid' | 'list') => {
  gridView.value = view
}

const handleExchange = () => {
  if (!canExchange.value || !selectedAsset.value) {
    return
  }
  
  const isRedeeming = exchangeAmount.value < 0
  const absAmount = Math.abs(exchangeAmount.value)
  const assetName = selectedAsset.value.backingAsset.name
  const tokenName = selectedAsset.value.symbol
  
  if (isRedeeming) {
    // Redeeming: tokens -> assets (e.g., 150 Chi parts -> 1 Chi ship)
    // TODO: Implement actual redemption logic
    // This should integrate with the blockchain redemption system
    
    
    // Show success popup for redemption
    successPopupData.value = {
      title: 'Assets Redeemed Successfully!',
      message: `You have successfully redeemed ${absAmount} ${tokenName} for ${absAmount} ${assetName}!`,
      details: {
        'Asset Name': assetName,
        'Token Redeemed': tokenName,
        'Amount': absAmount,
        'Exchange Rate': `${selectedAsset.value.exchangeRatio[1]} : ${selectedAsset.value.exchangeRatio[0]}`,
        'Minting Fee': `${mintingFee.value.toFixed(4)} SOL`
      }
    }
  } else {
    // Creating: assets -> tokens (e.g., 1 Chi ship -> 150 Chi parts)
    // TODO: Implement actual creation logic
    // This should integrate with the blockchain creation system
    
    
    // Show success popup for creation
    successPopupData.value = {
      title: 'Parts Created Successfully!',
      message: `You have successfully created ${absAmount} ${tokenName} from ${absAmount} ${assetName}!`,
      details: {
        'Token Name': tokenName,
        'Asset Used': assetName,
        'Amount': absAmount,
        'Exchange Rate': `${selectedAsset.value.exchangeRatio[1]} : ${selectedAsset.value.exchangeRatio[0]}`,
        'Creation Fee': `${mintingFee.value.toFixed(4)} SOL`
      }
    }
  }
  
  // Show the success popup
  showSuccessPopup.value = true
  
  // Trigger tutorial action if this is the Chi redemption step
  if (selectedAsset.value?.wrapperID === 'g1-rainbowchi-wrapper' && !isRedeeming) {
    if (tutorialStore.isActive && tutorialStore.currentStep?.id === 'redeem-chi') {
      setTimeout(() => {
        tutorialStore.handleButtonAction('redeem-chi')
      }, 500)
    }
  }
  
  // Reset form after exchange
  setTimeout(() => {
    exchangeAmount.value = 0
  }, 600)
}


// Lifecycle
onMounted(() => {
  loadCustomTypes()
  loadCustomAssets()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
})

</script>

<style scoped>
.foundry-custom-content {
  display: flex;
  min-height: 100%;
  background: var(--theme-background);
  position: relative;
  width: 100%;
  max-width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-height: 100%;
  overflow-y: visible;
  min-width: 0; /* Allow flex item to shrink below content size */
}

/* Wide screen margin - matching armory pattern */
@media (min-width: 1400px) {
  .foundry-custom-content {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}


/* Custom Type Info Card - FULL WIDTH */
.custom-type-info-card {
  width: 100%;
  background: var(--primary-color-0);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.custom-type-header {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

.custom-type-icon {
  flex-shrink: 0;
  width: 6rem;
  height: 6rem;
  border-radius: var(--theme-radius-lg);
  overflow: hidden;
  border: var(--component-border-width-thick) solid var(--secondary-color-2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-1);
}

.type-icon {
  font-size: var(--text-4xl);
  color: var(--secondary-color-0);
}

.custom-type-details {
  flex: 1;
}

.custom-type-name {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}

.custom-type-description {
  font-size: var(--text-lg);
  color: var(--text-color-1);
  margin-bottom: var(--space-lg);
  line-height: var(--leading-relaxed);
}

/* Custom Assets Container */
.custom-assets-container {
  width: 100%;
  max-width: 100%;
}

/* Custom Assets Grid Header */
.custom-assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding: 0;
}

/* Custom Assets Grid - EXACT ARMORY PATTERN */
.custom-assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21.875rem, 1fr));
  gap: var(--space-lg);
  height: auto;
  padding: 0;
}

/* Custom Asset Card */
.custom-asset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-lg);
  background: var(--primary-color-0);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 25rem;
}

.custom-asset-card:hover {
  transform: translateY(-0.0625rem);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color-0);
}

.custom-asset-card--selected {
  transform: translateY(-0.0625rem);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color-0);
  background: var(--secondary-color-2);
}

/* Custom Asset Card Image */
.custom-asset-card-image {
  width: 100%;
  max-width: 18.75rem;
  height: 18.75rem;
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  margin: var(--space-md) auto 0 auto;
  overflow: hidden;
  border: var(--component-border-width) solid var(--secondary-color-2);
}

.custom-asset-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Custom Asset Card Content */
.custom-asset-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  margin-top: var(--space-md);
}

.custom-asset-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-0);
  margin-bottom: var(--space-xs);
}

.grid-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
}

.grid-controls {
  display: flex;
  gap: var(--space-sm);
}

/* Asset Details Card */
.asset-details-card {
  width: 100%;
  max-width: 100%;
}

.asset-details-header {
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
}

/* Responsive asset details layout */
@media (max-width: 1024px) {
  .asset-details-header {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .asset-image-container {
    max-width: 100%;
    align-self: center;
  }
}

.asset-image-container {
  flex-shrink: 0;
  width: 100%;
  max-width: 31.25rem;
  aspect-ratio: 1;
  border-radius: var(--theme-radius-lg);
  overflow: hidden;
  border: var(--component-border-width-thick) solid var(--secondary-color-2);
}

.asset-large-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-info {
  flex: 1;
  padding: var(--space-lg);
}

.asset-name {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}

.asset-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin-bottom: var(--space-lg);
  line-height: var(--leading-relaxed);
}

.asset-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm);
  background: var(--primary-color-1);
  border-radius: var(--theme-radius-md);
  border: var(--component-border-width) solid var(--secondary-color-2);
}

.detail-label {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.detail-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* Calculation Section */
.calculation-section {
  margin-top: var(--space-lg);
}

.calculation-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}


/* Exchange Input Card */
.exchange-input-card {
  width: 100%;
  max-width: 100%;
}

.exchange-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
  max-width: 100%;
}

/* Button styling */
.exchange-section .base-button {
  width: 100%;
  justify-content: center;
}

/* Responsive exchange section */
@media (max-width: 768px) {
  .exchange-section {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .input-group {
    max-width: 100%;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  width: 100%;
  max-width: 100%;
}

.input-with-help {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
}

.input-help-text {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-style: italic;
  margin-bottom: var(--space-xs);
}

.input-label {
  font-size: var(--text-base);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-xs);
}

.amount-input {
  padding: var(--space-md) var(--space-lg);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--theme-radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  height: 3rem;
  min-height: 3rem;
  transition: border-color var(--transition-normal);
  flex: 1;
  min-width: 0;
  width: 100%;
}

.amount-input:focus {
  outline: none;
  border-color: var(--secondary-color-0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .custom-assets-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .custom-assets-header {
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }
}
</style>
