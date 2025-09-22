<template>
  <div class="tavern-raffles">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Raffles" 
      subtitle="Try your luck and win amazing prizes"
      variant="primary" 
      size="lg"
      class="raffles-header-card"
    >
      <div class="raffles-header-content">
        <div class="raffles-description">
          <p>Join exciting guild raffles and win amazing prizes! From rare resources to exclusive NFTs, test your luck and see what fortune awaits you in the tavern.</p>
        </div>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="raffles-main-card"
    >
      <!-- Raffles Grid -->
      <div v-if="activeRaffles.length > 0" class="raffles-grid">
        <BaseRaffle
          v-for="raffle in activeRaffles"
          :key="raffle.raffleId"
          :raffle-id="raffle.raffleId"
          :title="raffle.title"
          :description="raffle.description"
          :status="raffle.status"
          :tickets-total="raffle.ticketstotal"
          :ticket-price="raffle.ticketsprice"
          :payment-currency="raffle.ticketpaymentcurrency"
          :reward-token-id="raffle.rewardtokenid"
          :reward-amount="raffle.rewardamount"
          :tickets-sold-wallets="raffle.ticketsoldwallets"
          :winner="raffle.winner"
          :image-url="getRaffleImage(raffle)"
          @buy-tickets="handleBuyTickets"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:card-random" class="empty-icon" />
        <p>No raffles available at the moment</p>
        <p class="empty-subtitle">Check back later for exciting raffle opportunities</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseRaffle } from '@/components/base'

interface Raffle {
  guildID: string
  raffleId: string
  title: string
  description: string
  status: 'concept' | 'running' | 'finished'
  ticketstotal: number
  ticketsprice: number
  ticketpaymentcurrency: string
  rewardtokenid: string
  rewardamount: number
  ticketsoldwallets: string[]
  winner?: string | null
  createdby: string
  createdon: string
  imagepath?: string
}

const raffles = ref<Raffle[]>([])

// Only show active (running) raffles
const activeRaffles = computed(() => 
  raffles.value.filter(raffle => raffle.status === 'running')
)

const getRaffleImage = (raffle: Raffle) => {
  // Use the imagepath from the raffle data if available
  if (raffle.imagepath) {
    return raffle.imagepath
  }
  
  // Fallback to default image
  return '/SLP/nfts/nft-legendary-ship.png'
}

const handleBuyTickets = (purchase: { raffleId: string; quantity: number; totalCost: number }) => {
  console.log('Buying tickets:', purchase)
  // Here you would implement the actual ticket purchase logic
  // For now, just show a confirmation
  alert(`Purchasing ${purchase.quantity} tickets for ${purchase.totalCost} tokens from raffle ${purchase.raffleId}`)
}

const loadRaffles = async () => {
  try {
    // Get all raffle files dynamically
    const raffleModules = import.meta.glob('/public/SLP/raffles/*.json')
    const loadedRaffles: Raffle[] = []
    
    for (const path in raffleModules) {
      try {
        const raffleData = await fetch(path.replace('/public', ''))
        const raffle = await raffleData.json() as Raffle
        loadedRaffles.push(raffle)
      } catch (error) {
        console.warn(`Failed to load raffle from ${path}:`, error)
      }
    }
    
    // Sort by creation date (newest first) and status (running first)
    raffles.value = loadedRaffles.sort((a, b) => {
      // First sort by status priority (running > concept > finished)
      const statusPriority = { running: 3, concept: 2, finished: 1 }
      const statusDiff = statusPriority[b.status] - statusPriority[a.status]
      if (statusDiff !== 0) return statusDiff
      
      // Then by creation date
      return new Date(b.createdon).getTime() - new Date(a.createdon).getTime()
    })
  } catch (error) {
    console.error('Failed to load raffles:', error)
  }
}

onMounted(() => {
  loadRaffles()
})
</script>

<style scoped>
.tavern-raffles {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.raffles-header-card {
  width: 100%;
  max-width: 100%;
}

.raffles-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.raffles-description {
  flex: 1;
}

.raffles-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.raffles-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.raffles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-xl);
  padding: var(--space-md);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-color-1);
  opacity: 0.6;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  color: var(--secondary-color-0);
}

.empty-subtitle {
  font-size: var(--text-sm);
  opacity: 0.8;
  margin-top: var(--space-xs);
}

/* Wide screen margin - matching foundry layout */
@media (min-width: 1400px) {
  .raffles-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .raffles-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .tavern-raffles {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .tavern-raffles {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .raffles-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .raffles-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    padding: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .tavern-raffles {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}
</style>
