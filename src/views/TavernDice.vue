<template>
  <div class="tavern-dice">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Dice Challenge" 
      subtitle="Roll the dice and test your luck"
      variant="primary" 
      size="lg"
      class="dice-header-card"
    >
      <div class="dice-header-content">
        <div class="dice-description">
          <p>{{ diceGame?.description || 'Challenge fate with the dice! Guess the right number from 1 to 6 and win 5x your bet. Use your daily free spins or place your own bets for bigger rewards.' }}</p>
        </div>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="dice-main-card"
    >
      <div v-if="diceGame" class="dice-content">
        <!-- Game Area (70% width) -->
        <div class="dice-game-area">
          <!-- Game Info Header -->
          <div class="game-info">
            <h3 class="game-title" :style="{ color: getTextColor(0) }">{{ diceGame.name }}</h3>
            <div class="game-stats">
              <div class="stat-item">
                <Icon icon="game-icons:coins" :style="{ color: getSecondaryColor(2) }" />
                <span :style="{ color: getTextColor(1) }">Min Bet: {{ diceGame.minBet }} {{ diceGame.tokenID?.toUpperCase() }}</span>
              </div>
              <div class="stat-item">
                <Icon icon="game-icons:treasure" :style="{ color: getSecondaryColor(2) }" />
                <span :style="{ color: getTextColor(1) }">Max Bet: {{ diceGame.maxBet }} {{ diceGame.tokenID?.toUpperCase() }}</span>
              </div>
              <div class="stat-item">
                <Icon icon="game-icons:multiply" :style="{ color: getSecondaryColor(2) }" />
                <span :style="{ color: getTextColor(1) }">Win Multiplier: {{ diceGame.multiplier }}x</span>
              </div>
              <div class="stat-item">
                <Icon icon="game-icons:gift" :style="{ color: getSecondaryColor(2) }" />
                <span :style="{ color: getTextColor(1) }">Free Spins: {{ remainingFreeSpins }}/{{ diceGame.dailyFreeSpins }}</span>
              </div>
            </div>
          </div>

          <!-- Dice Game Interface -->
          <div class="dice-interface">
            <!-- Number Selection -->
            <div class="number-selection">
              <h4 :style="{ color: getTextColor(0) }">Choose your number (1-6):</h4>
              <div class="number-grid">
                <button
                  v-for="number in 6"
                  :key="number"
                  class="number-btn"
                  :class="{ active: selectedNumber === number }"
                  :style="getNumberButtonStyles(selectedNumber === number)"
                  @click="selectNumber(number)"
                  :disabled="isRolling"
                >
                  {{ number }}
                </button>
              </div>
            </div>

            <!-- Bet Amount -->
            <div class="bet-section">
              <h4 :style="{ color: getTextColor(0) }">Bet Amount:</h4>
              <div class="bet-controls">
                <div class="bet-input-group">
                  <input
                    v-model.number="betAmount"
                    type="number"
                    :min="diceGame.minBet"
                    :max="diceGame.maxBet"
                    class="bet-input"
                    :style="{ backgroundColor: getSecondaryColor(2), borderColor: getSecondaryColor(1), color: getTextColor(0) }"
                    :disabled="isRolling"
                  />
                  <span class="currency-label" :style="{ color: getTextColor(1) }">{{ diceGame.tokenID?.toUpperCase() }}</span>
                </div>
                <div class="bet-buttons">
                  <BaseButton 
                    variant="secondary" 
                    size="sm" 
                    @click="setBetAmount(diceGame.minBet)"
                    :disabled="isRolling"
                    :style="{ backgroundColor: getSecondaryColor(2), borderColor: getSecondaryColor(1), color: getTextColor(0) }"
                  >
                    Min
                  </BaseButton>
                  <BaseButton 
                    variant="secondary" 
                    size="sm" 
                    @click="setBetAmount(Math.floor(diceGame.maxBet / 2))"
                    :disabled="isRolling"
                    :style="{ backgroundColor: getSecondaryColor(2), borderColor: getSecondaryColor(1), color: getTextColor(0) }"
                  >
                    Half
                  </BaseButton>
                  <BaseButton 
                    variant="secondary" 
                    size="sm" 
                    @click="setBetAmount(diceGame.maxBet)"
                    :disabled="isRolling"
                    :style="{ backgroundColor: getSecondaryColor(2), borderColor: getSecondaryColor(1), color: getTextColor(0) }"
                  >
                    Max
                  </BaseButton>
                </div>
              </div>
              <div class="potential-win">
                <span :style="{ color: getPrimaryColor(1) }">Potential Win: {{ potentialWin }} {{ diceGame.tokenID?.toUpperCase() }}</span>
              </div>
            </div>

            <!-- Dice Display -->
            <div class="dice-display">
              <div class="dice-container">
                <div 
                  class="dice"
                  :class="{ rolling: isRolling }"
                  :style="diceStyles"
                  @click="rollDice"
                >
                  <div class="dice-face">
                    <div 
                      v-for="dot in getDiceDots(diceResult || 1)" 
                      :key="dot"
                      class="dice-dot"
                      :class="`dot-${dot}`"
                      :style="{ background: getTextColor(0) }"
                    />
                  </div>
                </div>
              </div>
              <div class="dice-result" v-if="lastRollResult">
                <p class="result-text" :class="lastRollResult.won ? 'win' : 'lose'" :style="{ color: lastRollResult.won ? getPrimaryColor(1) : getSecondaryColor(2) }">
                  {{ lastRollResult.won ? 'YOU WON!' : 'TRY AGAIN!' }}
                </p>
                <p class="result-details" :style="{ color: getTextColor(1) }">
                  Rolled: {{ lastRollResult.rolledNumber }} | 
                  Your guess: {{ lastRollResult.guessedNumber }}
                  <span v-if="lastRollResult.won"> | Won: {{ lastRollResult.winAmount }} {{ diceGame.tokenID?.toUpperCase() }}</span>
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <BaseButton 
                variant="primary"
                size="lg"
                @click="rollDice"
                :disabled="!canRoll"
                class="roll-button"
              >
                <Icon icon="game-icons:dice-six-faces-six" />
                {{ isRolling ? 'Rolling...' : 'Roll Dice' }}
              </BaseButton>
              
              <BaseButton 
                v-if="remainingFreeSpins > 0"
                variant="accent"
                size="lg"
                @click="rollFreeSpin"
                :disabled="!canRollFree"
                class="free-roll-button"
              >
                <Icon icon="game-icons:gift" />
                Free Spin ({{ remainingFreeSpins }} left)
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Last Spins Sidebar (20% width) -->
        <div class="last-spins-sidebar">
          <h4 :style="{ color: getTextColor(0) }">Recent Rolls</h4>
          <div class="spins-list">
            <div 
              v-for="(spin, index) in recentSpins" 
              :key="index"
              class="spin-item"
              :class="{ win: spin.won, lose: !spin.won }"
              :style="getSpinItemStyles(spin.won)"
            >
              <div class="spin-info">
                <div class="spin-numbers">
                  <span class="rolled" :style="{ backgroundColor: getSecondaryColor(0), color: getTextColor(1) }">{{ spin.rolledNumber }}</span>
                  <span class="vs" :style="{ color: getTextColor(2) }">vs</span>
                  <span class="guessed" :style="{ backgroundColor: getSecondaryColor(0), color: getTextColor(1) }">{{ spin.guessedNumber }}</span>
                </div>
                <div class="spin-result">
                  <span class="result-icon">
                    <Icon :icon="spin.won ? 'game-icons:trophy' : 'game-icons:cancel'" :style="{ color: spin.won ? getSecondaryColor(0) : getTextColor(2) }" />
                  </span>
                  <span class="amount" v-if="spin.won" :style="{ color: getSecondaryColor(0) }">
                    +{{ spin.winAmount }}
                  </span>
                  <span class="amount lose" v-else :style="{ color: getTextColor(2) }">
                    -{{ spin.betAmount }}
                  </span>
                </div>
              </div>
              <div class="spin-time" :style="{ color: getTextColor(2) }">{{ formatTime(spin.timestamp) }}</div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="recentSpins.length === 0" class="empty-spins">
            <Icon icon="game-icons:dice-six-faces-one" class="empty-icon" :style="{ color: getTextColor(2) }" />
            <p :style="{ color: getTextColor(2) }">No rolls yet</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:dice-six-faces-six" class="empty-icon" :style="{ color: getSecondaryColor(0) }" />
        <p :style="{ color: getTextColor(1) }">Dice game not available</p>
        <p class="empty-subtitle" :style="{ color: getTextColor(2) }">The dice game is currently unavailable for this guild</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseButton } from '@/components/base'
import { useGuildStore } from '@/stores/guildStore'
import { useSkinTheme } from '@/composables/useSkinTheme'

interface DiceGame {
  gameID: string
  guildID: string
  name: string
  description: string
  gameType: string
  tokenID: string
  minBet: number
  maxBet: number
  multiplier: number
  dailyFreeSpins: number
  isActive: boolean
  createdAt: string
  settings: {
    diceCount: number
    maxNumber: number
    minNumber: number
    animationDuration: number
    cooldownTime: number
  }
}

interface RollResult {
  rolledNumber: number
  guessedNumber: number
  betAmount: number
  winAmount: number
  won: boolean
  timestamp: Date
  isFreeSpin: boolean
}

const guildStore = useGuildStore()
const diceGame = ref<DiceGame | null>(null)
const selectedNumber = ref<number>(1)
const betAmount = ref<number>(10)
const isRolling = ref<boolean>(false)
const diceResult = ref<number>(1)
const lastRollResult = ref<RollResult | null>(null)
const recentSpins = ref<RollResult[]>([])
const remainingFreeSpins = ref<number>(3)

// Import theme system
const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

// Computed properties
const potentialWin = computed(() => {
  return betAmount.value * (diceGame.value?.multiplier || 5)
})

const canRoll = computed(() => {
  return !isRolling.value && 
         selectedNumber.value >= 1 && 
         selectedNumber.value <= 6 && 
         betAmount.value >= (diceGame.value?.minBet || 10) && 
         betAmount.value <= (diceGame.value?.maxBet || 500)
})

const canRollFree = computed(() => {
  return !isRolling.value && 
         remainingFreeSpins.value > 0 && 
         selectedNumber.value >= 1 && 
         selectedNumber.value <= 6
})

const diceStyles = computed(() => ({
  background: `linear-gradient(145deg, ${getPrimaryColor(0)}, ${getPrimaryColor(2)})`,
  borderColor: isRolling.value ? getPrimaryColor(2) : getPrimaryColor(1),
  boxShadow: isRolling.value 
    ? `inset 2px 2px 4px rgba(255, 255, 255, 0.2), inset -2px -2px 4px rgba(0, 0, 0, 0.2), 8px 8px 16px rgba(0, 0, 0, 0.4)`
    : `inset 2px 2px 4px rgba(255, 255, 255, 0.1), inset -2px -2px 4px rgba(0, 0, 0, 0.1), 4px 4px 8px rgba(0, 0, 0, 0.2)`
}))

const getNumberButtonStyles = (isActive: boolean) => ({
  backgroundColor: isActive ? getPrimaryColor(2) : getSecondaryColor(2),
  borderColor: isActive ? getPrimaryColor(2) : getSecondaryColor(1),
  color: isActive ? getTextColor(2) : getTextColor(0)
})

const getSpinItemStyles = (isWin: boolean) => ({
  backgroundColor: getSecondaryColor(2),
  borderColor: isWin ? getSecondaryColor(1) : getSecondaryColor(1),
  color: getTextColor(0)
})

// Methods
const selectNumber = (number: number) => {
  if (!isRolling.value) {
    selectedNumber.value = number
  }
}

const setBetAmount = (amount: number) => {
  betAmount.value = amount
}

const getDiceDots = (number: number): number[] => {
  const dotPatterns: Record<number, number[]> = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  }
  return dotPatterns[number] || [5]
}

const rollDice = async () => {
  if (!canRoll.value) return
  
  isRolling.value = true
  
  // Animate dice rolling
  const animationDuration = diceGame.value?.settings.animationDuration || 2000
  const rollInterval = setInterval(() => {
    diceResult.value = Math.floor(Math.random() * 6) + 1
  }, 100)
  
  setTimeout(() => {
    clearInterval(rollInterval)
    
    // Final roll result
    const finalResult = Math.floor(Math.random() * 6) + 1
    diceResult.value = finalResult
    
    // Check if won
    const won = finalResult === selectedNumber.value
    const winAmount = won ? betAmount.value * (diceGame.value?.multiplier || 5) : 0
    
    // Create roll result
    const rollResult: RollResult = {
      rolledNumber: finalResult,
      guessedNumber: selectedNumber.value,
      betAmount: betAmount.value,
      winAmount,
      won,
      timestamp: new Date(),
      isFreeSpin: false
    }
    
    lastRollResult.value = rollResult
    recentSpins.value.unshift(rollResult)
    
    // Keep only last 10 spins
    if (recentSpins.value.length > 10) {
      recentSpins.value = recentSpins.value.slice(0, 10)
    }
    
    isRolling.value = false
  }, animationDuration)
}

const rollFreeSpin = async () => {
  if (!canRollFree.value) return
  
  remainingFreeSpins.value--
  isRolling.value = true
  
  // Animate dice rolling
  const animationDuration = diceGame.value?.settings.animationDuration || 2000
  const rollInterval = setInterval(() => {
    diceResult.value = Math.floor(Math.random() * 6) + 1
  }, 100)
  
  setTimeout(() => {
    clearInterval(rollInterval)
    
    // Final roll result
    const finalResult = Math.floor(Math.random() * 6) + 1
    diceResult.value = finalResult
    
    // Check if won (free spins use min bet as base)
    const won = finalResult === selectedNumber.value
    const baseBet = diceGame.value?.minBet || 10
    const winAmount = won ? baseBet * (diceGame.value?.multiplier || 5) : 0
    
    // Create roll result
    const rollResult: RollResult = {
      rolledNumber: finalResult,
      guessedNumber: selectedNumber.value,
      betAmount: 0, // Free spin
      winAmount,
      won,
      timestamp: new Date(),
      isFreeSpin: true
    }
    
    lastRollResult.value = rollResult
    recentSpins.value.unshift(rollResult)
    
    // Keep only last 10 spins
    if (recentSpins.value.length > 10) {
      recentSpins.value = recentSpins.value.slice(0, 10)
    }
    
    isRolling.value = false
  }, animationDuration)
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const loadDiceGame = async () => {
  try {
    const currentGuildId = guildStore.guildId
    if (!currentGuildId) return
    
    const response = await fetch(`/SLP/minigames/${currentGuildId}_dice_game.json`)
    if (!response.ok) {
      console.warn(`Dice game not found for ${currentGuildId}`)
      return
    }
    
    const gameData = await response.json() as DiceGame
    
    if (gameData.guildID === currentGuildId && gameData.isActive) {
      diceGame.value = gameData
      betAmount.value = gameData.minBet
      remainingFreeSpins.value = gameData.dailyFreeSpins
    }
  } catch (error) {
    console.error('Failed to load dice game:', error)
  }
}

onMounted(() => {
  loadDiceGame()
})
</script>

<style scoped>
.tavern-dice {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.dice-header-card {
  width: 100%;
  max-width: 100%;
}

.dice-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.dice-description {
  flex: 1;
}

.dice-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.dice-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.dice-content {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-md);
  min-height: 600px;
}

.dice-game-area {
  flex: 0 0 70%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.last-spins-sidebar {
  flex: 0 0 20%;
  border-left: var(--border-width-thin) solid var(--border-color);
  padding-left: var(--space-md);
}

.game-info {
  text-align: center;
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-1);
}

.game-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-md) 0;
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  color: var(--text-color-1);
}

.dice-interface {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  align-items: center;
}

.number-selection {
  text-align: center;
}

.number-selection h4 {
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-sm);
  max-width: 400px;
}

.number-btn {
  width: 50px;
  height: 50px;
  border: var(--border-width-thin) solid;
  border-radius: var(--radius-md);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: var(--transition-fast);
}

.number-btn:hover {
  transform: scale(1.05);
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bet-section {
  text-align: center;
}

.bet-section h4 {
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
}

.bet-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: center;
}

.bet-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.bet-input {
  width: 120px;
  padding: var(--space-sm);
  border: var(--border-width-thin) solid;
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 1rem;
}

.currency-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.bet-buttons {
  display: flex;
  gap: var(--space-xs);
}

.potential-win {
  margin-top: var(--space-sm);
  font-size: 1rem;
  font-weight: 600;
}

.dice-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  width: 100%;
}

.dice-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.dice {
  width: 100px;
  height: 100px;
  border: var(--border-width-thin) solid;
  border-radius: var(--radius-2xl);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
}

.dice:hover {
  transform: scale(1.05);
}

.dice.rolling {
  animation: diceRoll 0.1s infinite;
}

@keyframes diceRoll {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

.dice-face {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 70px;
  height: 70px;
  gap: 2px;
  justify-items: center;
  align-items: center;
}

.dice-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  opacity: 0;
}

.dice-dot.dot-1 { grid-area: 1 / 1; opacity: 1; }
.dice-dot.dot-2 { grid-area: 1 / 2; opacity: 1; }
.dice-dot.dot-3 { grid-area: 1 / 3; opacity: 1; }
.dice-dot.dot-4 { grid-area: 2 / 1; opacity: 1; }
.dice-dot.dot-5 { grid-area: 2 / 2; opacity: 1; }
.dice-dot.dot-6 { grid-area: 2 / 3; opacity: 1; }
.dice-dot.dot-7 { grid-area: 3 / 1; opacity: 1; }
.dice-dot.dot-8 { grid-area: 3 / 2; opacity: 1; }
.dice-dot.dot-9 { grid-area: 3 / 3; opacity: 1; }

.dice-result {
  text-align: center;
}

.result-text {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-sm) 0;
}

.result-text.win {
  color: var(--color-success);
}

.result-text.lose {
  color: var(--color-error);
}

.result-details {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.roll-button,
.free-roll-button {
  min-width: 150px;
}

/* Last Spins Sidebar */
.last-spins-sidebar h4 {
  color: var(--text-color-0);
  margin-bottom: var(--space-md);
  text-align: center;
}

.spins-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.spin-item {
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: var(--border-width-thin) solid var(--secondary-color-1);
  background: var(--primary-color-1);
}

.spin-item.win {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 10%, var(--primary-color-1));
}

.spin-item.lose {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 10%, var(--primary-color-1));
}

.spin-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.spin-numbers {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
}

.rolled,
.guessed {
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--secondary-color-2);
}

.vs {
  font-size: var(--text-xs);
  color: var(--text-color-2);
}

.spin-result {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.result-icon {
  font-size: var(--text-sm);
}

.amount {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.amount:not(.lose) {
  color: var(--color-success);
}

.amount.lose {
  color: var(--color-error);
}

.spin-time {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  text-align: center;
}

.empty-spins {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-color-2);
  opacity: 0.6;
}

.empty-spins .empty-icon {
  width: 32px;
  height: 32px;
  margin-bottom: var(--space-sm);
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

/* Wide screen margin - matching other tavern pages */
@media (min-width: 1400px) {
  .dice-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .dice-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .tavern-dice {
    padding: var(--space-md);
  }
  
  .dice-content {
    flex-direction: column;
  }
  
  .dice-game-area {
    flex: 1;
  }
  
  .last-spins-sidebar {
    flex: 1;
    border-left: none;
    border-top: var(--border-width-thin) solid var(--border-color);
    padding-left: 0;
    padding-top: var(--space-md);
  }
}

@media (max-width: 768px) {
  .tavern-dice {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .dice-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .dice-content {
    padding: var(--space-sm);
    gap: var(--space-md);
  }
  
  .game-stats {
    grid-template-columns: 1fr;
  }
  
  .number-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }
  
  .number-btn {
    width: 60px;
    height: 60px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .tavern-dice {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .number-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
