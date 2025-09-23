<template>
  <div 
    :class="cardClasses"
    :style="cardStyles"
    @click="handleClick"
  >
    <!-- Trade Type Badge -->
    <div class="trade-type-badge" :class="`badge-${tradeType}`">
      {{ tradeType.toUpperCase() }}
    </div>

    <!-- Trade Pair -->
    <div class="trade-pair">
      {{ tradePair }}
    </div>

    <!-- Item Image and Details -->
    <div class="item-section">
      <div class="item-image-container">
        <img 
          :src="itemImage" 
          :alt="itemName"
          class="item-image"
        />
      </div>
      <div class="item-details">
        <h3 class="item-name">{{ itemName }}</h3>
        <p class="item-id">{{ itemId }}</p>
      </div>
    </div>

    <!-- Trade Details -->
    <div class="trade-details">
      <div class="detail-row">
        <span class="detail-label">Amount:</span>
        <span class="detail-value">{{ itemAmount }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Unit Price:</span>
        <span class="detail-value">{{ unitPrice }} {{ currencyToken }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total:</span>
        <span class="detail-value">{{ totalPrice }} {{ currencyToken }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { getSlpPath } from '@/utils/api'

interface Props {
  // Trade data
  orderID: string
  guildID: string
  role: string
  type: 'buy' | 'sell'
  amountOffered: number
  tokenIDOffered?: string
  resourceIDOffered?: string
  tokenImageOffered?: string
  amountAsked: number
  resourceIDAsked?: string
  tokenIDAsked?: string
  tokenImageAsked?: string
  status: string
  created: string
  creator: string
  expiresAt: string
  isActive: boolean
  description: string
  filledAt?: string
  filledBy?: string
  
  // Card styling
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  hover: true,
  clickable: true
})

const emit = defineEmits<{
  click: [trade: Props]
}>()

const { colors, spacing, typography, borderRadius, shadows, componentSizes } = useDesignTokens()
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

// Computed properties
const tradeType = computed(() => props.type)
const tradePair = computed(() => {
  if (props.type === 'buy') {
    return `${props.tokenIDOffered}/${props.resourceIDAsked}`
  } else {
    return `${props.resourceIDOffered}/${props.tokenIDAsked}`
  }
})

const itemImage = computed(() => {
  // Use the correct image field based on trade type
  let imagePath = ''
  if (props.type === 'buy') {
    imagePath = props.tokenImageAsked || ''
  } else {
    imagePath = props.tokenImageOffered || ''
  }
  
  // Process the image path to handle /SLP/ prefix
  if (imagePath.startsWith('/SLP/')) {
    return getSlpPath(imagePath.replace('/SLP/', ''))
  }
  
  return imagePath
})

const itemName = computed(() => {
  if (props.type === 'buy') {
    return props.resourceIDAsked
  } else {
    return props.resourceIDOffered
  }
})

const itemId = computed(() => {
  if (props.type === 'buy') {
    return props.resourceIDAsked
  } else {
    return props.resourceIDOffered
  }
})

const itemAmount = computed(() => {
  if (props.type === 'buy') {
    return props.amountAsked
  } else {
    return props.amountOffered
  }
})

const unitPrice = computed(() => {
  if (props.type === 'buy') {
    return (props.amountOffered / props.amountAsked).toFixed(3)
  } else {
    return (props.amountAsked / props.amountOffered).toFixed(3)
  }
})

const totalPrice = computed(() => {
  if (props.type === 'buy') {
    return props.amountOffered
  } else {
    return props.amountAsked
  }
})
const currencyToken = computed(() => {
  return props.type === 'buy' ? props.tokenIDOffered : props.tokenIDAsked
})

// Card styling
const cardClasses = computed(() => [
  'base-g2p-card',
  `card-${props.size}`,
  `card-${props.type}`,
  {
    'card-hover': props.hover,
    'card-clickable': props.clickable
  }
])

const cardStyles = computed(() => {
  const sizeConfig = componentSizes[props.size]
  
  return {
    '--primary-color-0': getPrimaryColor(0),
    '--primary-color-1': getPrimaryColor(1),
    '--primary-color-2': getPrimaryColor(2),
    '--secondary-color-0': getSecondaryColor(0),
    '--secondary-color-1': getSecondaryColor(1),
    '--secondary-color-2': getSecondaryColor(2),
    '--text-color-0': getTextColor(0),
    '--text-color-1': getTextColor(1),
    '--text-color-2': getTextColor(2),
    '--padding': sizeConfig.padding,
    '--font-size': sizeConfig.fontSize,
    '--border-radius': sizeConfig.borderRadius,
    '--gap': sizeConfig.gap
  }
})

// Event handlers
const handleClick = () => {
  if (props.clickable) {
    emit('click', props)
  }
}
</script>

<style scoped>
.base-g2p-card {
  position: relative;
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--border-radius);
  padding: var(--padding);
  transition: all var(--transition-normal);
  cursor: pointer;
  overflow: hidden;
}

.card-buy {
  border-left: 6px solid var(--color-success);
}

.card-sell {
  border-left: 6px solid var(--color-error);
}

/* Remove the top border - we only want left border colored */

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color-1);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Trade Type Badge */
.trade-type-badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border-radius: var(--border-radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-buy {
  background: var(--color-success);
}

.badge-sell {
  background: var(--color-error);
}

/* Trade Pair */
.trade-pair {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

/* Item Section */
.item-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  margin: var(--space-xl) 0 var(--space-lg) 0;
}

.item-image-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: var(--border-width-medium) solid var(--secondary-color-2);
  background: var(--primary-color-1);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  text-align: center;
}

.item-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-xs) 0;
}

.item-id {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  margin: 0;
  font-family: monospace;
}

/* Trade Details */
.trade-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.detail-label {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

.detail-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* Size variants */
.card-sm {
  --padding: var(--space-sm);
  --font-size: var(--text-sm);
  --border-radius: var(--border-radius-md);
  --gap: var(--space-sm);
}

.card-md {
  --padding: var(--space-md);
  --font-size: var(--text-base);
  --border-radius: var(--border-radius-lg);
  --gap: var(--space-md);
}

.card-lg {
  --padding: var(--space-lg);
  --font-size: var(--text-lg);
  --border-radius: var(--border-radius-xl);
  --gap: var(--space-lg);
}

.card-xl {
  --padding: var(--space-xl);
  --font-size: var(--text-xl);
  --border-radius: var(--border-radius-2xl);
  --gap: var(--space-xl);
}

/* Responsive Design */
@media (max-width: 768px) {
  .base-g2p-card {
    padding: var(--space-sm);
  }
  
  .item-image-container {
    width: 60px;
    height: 60px;
  }
  
  .item-name {
    font-size: var(--text-base);
  }
  
  .trade-details {
    gap: var(--space-xs);
  }
  
  .detail-label,
  .detail-value {
    font-size: var(--text-xs);
  }
}
</style>
