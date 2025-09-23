<template>
  <BaseFoundry>
    <div class="foundry-nft-content">
      <!-- Sidebar with Collection Links -->
      <BaseSidebar
        :items="collectionItems"
        variant="primary"
        position="left"
        width="4rem"
        @item-click="handleCollectionClick"
      />

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Collection Info Card -->
        <BaseCard 
          v-if="selectedCollection"
          variant="primary" 
          size="lg"
          class="collection-info-card"
        >
          <div class="collection-header">
            <div class="collection-icon">
              <img 
                :src="getCollectionImage(selectedCollection)" 
                :alt="selectedCollection.name"
                class="collection-image"
              />
            </div>
            <div class="collection-details">
              <h2 class="collection-name">{{ selectedCollection.name }}</h2>
              <p class="collection-description">{{ selectedCollection.description }}</p>
              <div class="collection-stats">
                <div class="stat">
                  <span class="stat-label">Total Supply:</span>
                  <span class="stat-value">{{ selectedCollection.totalSupply }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Minted:</span>
                  <span class="stat-value">{{ selectedCollection.mintedSupply }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Price:</span>
                  <span class="stat-value">{{ selectedCollection.mintPrice }} {{ selectedCollection.mintCurrency }}</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- NFT Grid -->
        <BaseCard 
          v-if="selectedCollection"
          variant="neutral" 
          size="xl"
          class="nft-grid-card"
        >
          <div class="nft-grid-header">
            <h3 class="grid-title">Available NFTs</h3>
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
          :items="nftGridItems"
          :columns="gridColumns"
          :hover="true"
          :clickable="true"
          :large-icons="true"
          size="lg"
          variant="primary"
          @item-click="handleNFTClick"
        />
        </BaseCard>

        <!-- Selected NFT Details Card -->
        <BaseCard 
          v-if="selectedNFT"
          variant="primary" 
          size="lg"
          class="nft-details-card"
        >
          <div class="nft-details-header">
            <div class="nft-image-container">
              <img 
                :src="getNFTImage(selectedNFT)" 
                :alt="selectedNFT.name"
                class="nft-large-image"
              />
            </div>
            <div class="nft-info">
              <h3 class="nft-name">{{ selectedNFT.name }}</h3>
              <p class="nft-id">Token ID: {{ selectedNFT.tokenId }}</p>
              
              <!-- Traits Section -->
              <div class="traits-section">
                <h4 class="traits-title">Traits</h4>
                <BaseListGrid
                  :items="traitItems"
                  :columns="1"
                  :hover="true"
                  size="sm"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Minting Card -->
        <BaseCard 
          v-if="selectedNFT"
          variant="neutral" 
          size="lg"
          class="minting-card"
        >
          <div class="minting-section">
            <div class="minting-fee">
              <span class="fee-label">Minting Fee:</span>
              <span class="fee-value">{{ selectedCollection?.mintPrice || 0 }} {{ selectedCollection?.mintCurrency || 'CCC' }}</span>
            </div>
            <BaseButton
              variant="accent"
              size="lg"
              icon="mdi:plus-circle"
              @click="handleMint"
            >
              Mint
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </BaseFoundry>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseFoundry from '@/components/BaseFoundry.vue'
import { BaseCard, BaseButton, BaseListGrid } from '@/components/base'
import BaseSidebar from '@/components/base/BaseSidebar.vue'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { getSlpPath } from '@/utils/api'
import type { SidebarItem } from '@/components/base/BaseSidebar'

// Types
interface NFTCollection {
  collectionID: string
  guildID: string
  name: string
  symbol: string
  description: string
  image: string
  type: string
  rarity: string
  totalSupply: number
  mintedSupply: number
  maxPerWallet: number
  mintPrice: number
  mintCurrency: string
  createdAt: string
  isActive: boolean
  isPublic: boolean
  contractAddress: string
  traits: Array<{
    trait_type: string
    values: string[]
  }>
  sampleNFTs: Array<{
    tokenId: number
    name: string
    image: string
    traits: Record<string, string>
  }>
}

interface NFTItem {
  id: string
  icon: string
  title: string
  subtitle: string
  value: string
  description: string
  nftData: any
}

// Composables
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

// State
const selectedCollection = ref<NFTCollection | null>(null)
const selectedNFT = ref<any>(null)
const collections = ref<NFTCollection[]>([])
const gridView = ref<'grid' | 'list'>('grid')

// Computed
const collectionItems = computed((): SidebarItem[] => {
  return collections.value.map(collection => ({
    id: collection.collectionID,
    icon: getCollectionIcon(collection.type),
    title: collection.type.replace('_', ' ').toUpperCase(),
    active: selectedCollection.value?.collectionID === collection.collectionID
  }))
})

const nftGridItems = computed((): NFTItem[] => {
  if (!selectedCollection.value) {
    return []
  }
  
  return selectedCollection.value.sampleNFTs.map(nft => ({
    id: `nft-${nft.tokenId}`,
    icon: getNFTImage(nft),
    title: `#${nft.tokenId}`,
    subtitle: '',
    value: '',
    description: '',
    nftData: nft
  }))
})

const gridColumns = computed(() => gridView.value === 'grid' ? 4 : 1)

const traitItems = computed(() => {
  if (!selectedNFT.value) return []
  
  return Object.entries(selectedNFT.value.traits).map(([trait, value]) => ({
    id: `trait-${trait}`,
    icon: 'mdi:tag',
    title: trait,
    subtitle: String(value),
    value: '',
    description: ''
  }))
})

// Methods
const loadCollections = async () => {
  try {
    const collectionFiles = [
      'collection-avatar.json',
      'collection-achievements.json',
      'collection-tournamentreward.json'
    ]
    
    const loadedCollections: NFTCollection[] = []
    
    for (const file of collectionFiles) {
      const response = await fetch(getSlpPath(`nftcollections/${file}`))
      if (response.ok) {
        const collection = await response.json()
        loadedCollections.push(collection)
      }
    }
    
    collections.value = loadedCollections
    
    // Select first collection by default
    if (loadedCollections.length > 0) {
      selectedCollection.value = loadedCollections[0]
    }
  } catch (error) {
    console.error('Error loading collections:', error)
  }
}

const getCollectionIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'avatar': 'mdi:account-circle',
    'achievement': 'mdi:trophy',
    'tournament_reward': 'mdi:medal',
    'default': 'mdi:image'
  }
  return iconMap[type] || iconMap.default
}

const getCollectionImage = (collection: NFTCollection): string => {
  // Use appropriate collection images based on type
  if (collection.type === 'achievement') {
    return getSlpPath('nfts/achievement (1).png')
  } else if (collection.type === 'trophy') {
    return getSlpPath('nfts/Trophy (1).png')
  } else {
    return getSlpPath('nfts/avatar1.png')
  }
}

const getNFTImage = (nft: any): string => {
  // Use the actual image path from the NFT data
  if (nft.image) {
    return getSlpPath(`nfts/${nft.image}`)
  }
  
  // Fallback to avatar images if no image specified
  const avatarImages = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png']
  const imageIndex = (nft.tokenId - 1) % avatarImages.length
  return getSlpPath(`nfts/${avatarImages[imageIndex]}`)
}

const handleCollectionClick = (item: SidebarItem) => {
  const collection = collections.value.find(c => c.collectionID === item.id)
  if (collection) {
    selectedCollection.value = collection
    selectedNFT.value = null // Clear selected NFT when switching collections
  }
}

const handleNFTClick = (item: any) => {
  selectedNFT.value = item.nftData
}

const setGridView = (view: 'grid' | 'list') => {
  gridView.value = view
}

const handleMint = () => {
  if (!selectedNFT.value || !selectedCollection.value) {
    return
  }
  
  // Demo: Show minting calculation
  alert(`Minting ${selectedNFT.value.name} for ${selectedCollection.value.mintPrice} ${selectedCollection.value.mintCurrency}`)
}

// Lifecycle
onMounted(() => {
  loadCollections()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.foundry-nft-content {
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
  .foundry-nft-content {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .main-content {
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .foundry-nft-content {
    gap: var(--space-sm);
  }
  
  .main-content {
    gap: var(--space-sm);
  }
}

/* Collection Info Card */
.collection-info-card {
  width: 100%;
  max-width: 100%;
}

.collection-header {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

/* Responsive collection header layout */
@media (max-width: 768px) {
  .collection-header {
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }
  
  .collection-icon {
    align-self: center;
  }
  
  .collection-stats {
    justify-content: center;
  }
}

.collection-icon {
  flex-shrink: 0;
  width: var(--space-3xl);
  height: var(--space-3xl);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: var(--component-border-width-thick) solid var(--secondary-color-2);
}

.collection-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-details {
  flex: 1;
}

.collection-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-sm);
}

.collection-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin-bottom: var(--space-md);
  line-height: var(--leading-relaxed);
}

.collection-stats {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.stat-value {
  font-size: var(--text-lg);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* NFT Grid Card */
.nft-grid-card {
  width: 100%;
  max-width: 100%;
}

.nft-grid-header {
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

/* NFT Details Card */
.nft-details-card {
  width: 100%;
  max-width: 100%;
}

.nft-details-header {
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
}

/* Responsive NFT details layout */
@media (max-width: 1024px) {
  .nft-details-header {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .nft-image-container {
    max-width: 100%;
    align-self: center;
  }
}

.nft-image-container {
  flex-shrink: 0;
  width: 100%;
  max-width: 31.25rem;
  aspect-ratio: 1;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: var(--component-border-width-thick) solid var(--secondary-color-2);
}

.nft-large-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-info {
  flex: 1;
  padding: var(--space-lg);
}

.nft-name {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}

.nft-id {
  font-size: var(--text-xl);
  color: var(--text-color-1);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-lg);
}

/* Traits Section */
.traits-section {
  margin-top: var(--space-lg);
}

.traits-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}

/* Minting Card */
.minting-card {
  width: 100%;
  max-width: 100%;
}

.minting-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
}

.minting-fee {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.fee-label {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.fee-value {
  font-size: var(--text-2xl);
  color: var(--text-color-0);
  font-weight: var(--font-bold);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .nft-image-container {
    max-width: 25rem;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 6.25rem;
  }
  
  .nft-image-container {
    max-width: 20rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 5rem;
    padding: var(--space-md);
  }
  
  .collection-header {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .nft-details-header {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .nft-image-container {
    max-width: 18.75rem;
    align-self: center;
  }
  
  .minting-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .minting-section .base-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-content {
    margin-left: 4.375rem;
    padding: var(--space-sm);
  }
  
  .collection-stats {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .nft-grid-header {
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }
  
  .nft-image-container {
    max-width: 15rem;
  }
}
</style>
