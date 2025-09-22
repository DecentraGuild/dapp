import type { ShapeMapping } from '../types'

// Mapping navigation item names to SVG shape IDs
// These correspond to the title attributes in the SVG files
export const shapeMapping: ShapeMapping = {
  'dashboard': 'communityhub',
  'questboard': 'questboard',
  'tavern': 'tavern',
  'armory': 'armory',
  'foundry': 'foundry',
  'trophy-room': 'trophyroom',
  'dao-voting': 'dao',
  'vaults': 'vaults',
  'observatory': 'observatory',
  'gatekeeping': 'gatekeeping',
  'community-hub': 'communityhub',
  'integrations': 'intergration',
  'commandcenter': 'commandcenter'
}

export function getShapeId(navigationName: string): string {
  return shapeMapping[navigationName] || navigationName
}

export function getShapeIdFromPath(path: string): string {
  // Extract the main path segment
  const pathSegments = path.split('/')
  const mainPath = pathSegments[0]
  return getShapeId(mainPath)
}
