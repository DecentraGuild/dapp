/**
 * Get the correct API path for GitHub Pages deployment
 * Handles the base path automatically
 */
export function getApiPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // For GitHub Pages, we need to include the repository name in the path
  const basePath = import.meta.env.BASE_URL || '/DecentraWebApp/'
  
  // Ensure basePath ends with a slash
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`
  
  return `${normalizedBasePath}${cleanPath}`
}

/**
 * Get the correct SLP data path
 */
export function getSlpPath(path: string): string {
  return getApiPath(`SLP/${path}`)
}

/**
 * Get the correct image path for SLP assets
 */
export function getImagePath(imagePath: string): string {
  // Handle both absolute and relative paths
  if (imagePath.startsWith('/SLP/')) {
    return getSlpPath(imagePath.replace('/SLP/', ''))
  }
  return imagePath
}
