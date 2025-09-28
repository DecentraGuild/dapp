// Event Type Configuration
export const EVENT_TYPE_ICONS = {
  poker_tournament: 'game-icons:card-play',
  raid: 'game-icons:human-target',
  meeting: 'game-icons:tabletop-players',
  chill_session: 'game-icons:rocking-chair',
  gaming: 'game-icons:gamepad'
} as const

export const EVENT_TYPE_TITLES = {
  poker_tournament: 'Poker Tournament',
  raid: 'Raid Event',
  meeting: 'Guild Meeting',
  chill_session: 'Chill Session',
  gaming: 'Gaming Event'
} as const

export const EVENT_TYPE_SIDEBAR = {
  poker_tournament: 'Poker',
  raid: 'Raid',
  meeting: 'Meeting',
  chill_session: 'Chill',
  gaming: 'Gaming'
} as const

export const EVENT_TYPE_COLORS = {
  poker_tournament: 'var(--color-warning)',
  raid: 'var(--color-error)',
  meeting: 'var(--color-success)',
  chill_session: 'var(--color-info)',
  gaming: 'var(--color-info)'
} as const