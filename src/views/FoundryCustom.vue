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
        <!-- Custom Type Info Card -->
        <BaseCard 
          v-if="selectedCustomType"
          variant="primary" 
          size="lg"
          class="custom-type-info-card"
        >
          <div class="custom-type-header">
            <div class="custom-type-icon">
              <Icon :icon="selectedCustomType.icon" class="type-icon" />
            </div>
            <div class="custom-type-details">
              <h2 class="custom-type-name">{{ selectedCustomType.name }}</h2>
              <p class="custom-type-description">{{ selectedCustomType.description }}</p>
            </div>
          </div>
        </BaseCard>

        <!-- Custom Assets Grid -->
        <BaseCard 
          v-if="selectedCustomType"
          variant="neutral" 
          size="xl"
          class="custom-assets-grid-card"
        >
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
          
          <BaseListGrid
            :items="customAssetItems"
            :columns="gridColumns"
            :hover="true"
            :clickable="true"
            :large-icons="true"
            size="lg"
            variant="primary"
            @item-click="handleAssetClick"
          />
        </BaseCard>

        <!-- Selected Asset Details Card -->
        <BaseCard 
          v-if="selectedAsset"
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
                  <span class="detail-value">{{ selectedAsset.circulatingSupply }}</span>
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
            </div>
          </div>
        </BaseCard>

        <!-- Exchange Input Card -->
        <BaseCard 
          v-if="selectedAsset"
          variant="primary" 
          size="lg"
          class="exchange-input-card"
        >
          <div class="exchange-section">
            <div class="input-group">
              <label class="input-label">Amount to Exchange</label>
              <input 
                v-model="exchangeAmount"
                type="number"
                class="amount-input"
                placeholder="Enter amount"
                min="1"
                :max="selectedAsset.circulatingSupply"
              />
            </div>
            <BaseButton
              variant="accent"
              size="lg"
              icon="mdi:swap-horizontal"
              @click="handleExchange"
              :disabled="!canExchange"
            >
              Exchange
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </BaseFoundry>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFoundry from '@/components/BaseFoundry.vue'
import { BaseCard, BaseButton, BaseListGrid, BaseList } from '@/components/base'
import BaseSidebar from '@/components/base/BaseSidebar.vue'
import { useSkinTheme } from '@/composables/useSkinTheme'
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
  exchangeRatio: [number, number]
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
}

// Composables
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

// State
const selectedCustomType = ref<CustomType | null>(null)
const selectedAsset = ref<CustomAsset | null>(null)
const customTypes = ref<CustomType[]>([])
const customAssets = ref<CustomAsset[]>([])
const gridView = ref<'grid' | 'list'>('grid')
const exchangeAmount = ref<number>(0)

// Computed
const customTypeItems = computed((): SidebarItem[] => {
  return customTypes.value.map(type => ({
    id: type.typeID,
    icon: type.icon,
    title: type.name.toUpperCase(),
    active: selectedCustomType.value?.typeID === type.typeID
  }))
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
    assetData: asset
  }))
})

const gridColumns = computed(() => gridView.value === 'grid' ? 4 : 1)

const calculationItems = computed(() => {
  if (!selectedAsset.value) return []
  
  return [
    {
      id: 'amount',
      icon: 'mdi:counter',
      title: 'Amount',
      subtitle: `${exchangeAmount.value || 0}`
    },
    {
      id: 'rate',
      icon: 'mdi:swap-horizontal',
      title: 'Exchange Rate',
      subtitle: `${selectedAsset.value.exchangeRatio[1]} : ${selectedAsset.value.exchangeRatio[0]}`
    },
    {
      id: 'fee',
      icon: 'mdi:percent',
      title: 'Minting Fee',
      subtitle: `${mintingFee.value.toFixed(2)}`
    },
    {
      id: 'total',
      icon: 'mdi:calculator',
      title: 'Total Cost',
      subtitle: `${totalCost.value.toFixed(2)}`
    }
  ]
})

const mintingFee = computed(() => {
  if (!selectedAsset.value) return 0
  return exchangeAmount.value * 0.01 // 1% fee
})

const totalCost = computed(() => {
  if (!selectedAsset.value || !exchangeAmount.value) return 0
  // Fixed exchange rate calculation - 1 asset gives X tokens
  const exchangeCost = (exchangeAmount.value * selectedAsset.value.exchangeRatio[1]) / selectedAsset.value.exchangeRatio[0]
  return exchangeCost + mintingFee.value
})

const canExchange = computed(() => {
  return selectedAsset.value && 
         exchangeAmount.value > 0 && 
         exchangeAmount.value <= (selectedAsset.value.circulatingSupply || 0)
})

// Methods
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
    console.error('Error loading custom types:', error)
  }
}

const loadCustomAssets = async () => {
  try {
    const assetFiles = [
      'guild-1_pearcer6-wrapper.json',
      'guild-1_maxhog-wrapper.json',
      'guild-1_opaljet-wrapper.json',
      'guild-1_pearcex4-wrapper.json',
      'guild-1_pearcex5-wrapper.json',
      'guild-1_pearcex6-wrapper.json',
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
    console.error('Error loading custom assets:', error)
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

const handleAssetClick = (item: any) => {
  selectedAsset.value = item.assetData
  exchangeAmount.value = 0 // Reset exchange amount
}

const setGridView = (view: 'grid' | 'list') => {
  gridView.value = view
}

const handleExchange = () => {
  if (!canExchange.value || !selectedAsset.value) {
    return
  }
  
  // Demo: Show exchange calculation
  alert(`Exchanging ${exchangeAmount.value} ${selectedAsset.value.symbol} for ${totalCost.value} tokens`)
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

/* Responsive Layout */
@media (max-width: 1200px) {
  .foundry-custom-content {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .main-content {
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .foundry-custom-content {
    gap: var(--space-sm);
  }
  
  .main-content {
    gap: var(--space-sm);
  }
}

/* Custom Type Info Card */
.custom-type-info-card {
  width: 100%;
  max-width: 100%;
}

.custom-type-header {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

/* Responsive header layout */
@media (max-width: 768px) {
  .custom-type-header {
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }
  
  .custom-type-icon {
    align-self: center;
  }
}

.custom-type-icon {
  flex-shrink: 0;
  width: var(--space-3xl);
  height: var(--space-3xl);
  border-radius: var(--border-radius-lg);
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
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-sm);
}

.custom-type-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin-bottom: var(--space-md);
  line-height: var(--leading-relaxed);
}

/* Custom Assets Grid Card */
.custom-assets-grid-card {
  width: 100%;
  max-width: 100%;
}

.custom-assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
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
  border-radius: var(--border-radius-lg);
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
  border-radius: var(--border-radius-md);
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
  justify-content: flex-end;
  align-items: flex-end;
  gap: var(--space-lg);
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
  gap: var(--space-sm);
  max-width: 12.5rem;
}

.input-label {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.amount-input {
  padding: var(--space-sm) var(--space-md);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: var(--text-base);
  transition: border-color var(--transition-normal);
}

.amount-input:focus {
  outline: none;
  border-color: var(--secondary-color-0);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .asset-image-container {
    max-width: 25rem;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 6.25rem;
  }
  
  .asset-image-container {
    max-width: 20rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 5rem;
    padding: var(--space-md);
  }
  
  .custom-type-header {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .asset-details-header {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .asset-image-container {
    max-width: 18.75rem;
    align-self: center;
  }
  
  .exchange-section {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
}

@media (max-width: 480px) {
  .main-content {
    margin-left: 4.375rem;
    padding: var(--space-sm);
  }
  
  .custom-assets-header {
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }
  
  .asset-image-container {
    max-width: 15rem;
  }
  
  .input-group {
    max-width: 100%;
  }
}
</style>
