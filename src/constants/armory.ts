// Armory Constants
export const ARMORY_TABS = {
  CLAIM: 'claim',
  SHOP: 'shop',
  USE: 'use'
} as const

export const ARMORY_ICONS = {
  CLAIM: 'game-icons:open-treasure-chest',
  SHOP: 'game-icons:buy-card',
  USE: 'game-icons:spiked-shoulder-armor'
} as const

export const ARMORY_TITLES = {
  CLAIM: 'Claim Center',
  SHOP: 'G2P Trading Floor',
  USE: 'Gear Lending System'
} as const

export const ARMORY_DESCRIPTIONS = {
  CLAIM: 'Claim rewards and airdrops',
  SHOP: 'G2P trades and marketplace',
  USE: 'Borrow and return gear with collateral'
} as const

export const ARMORY_FEATURES = {
  CLAIM: [
    'Reward claiming',
    'Airdrop distribution',
    'Snapshot-based rewards',
    'Role-based benefits'
  ],
  SHOP: [
    'Guild-to-Player trading',
    'Resource marketplace',
    'Token exchanges',
    'Trade execution'
  ],
  USE: [
    'Gear borrowing system',
    'Collateral management',
    'Equipment lending',
    'Return tracking'
  ]
} as const
