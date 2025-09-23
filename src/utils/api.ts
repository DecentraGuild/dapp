/**
 * Get the correct API path for deployment
 * Handles both GitHub Pages and subdomain deployments automatically
 */
export function getApiPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Get base path from environment or detect from current location
  let basePath = import.meta.env.BASE_URL || '/DecentraWebApp/'
  
  // If we're on a subdomain (like dapp.decentraguild.com), use root path
  if (typeof window !== 'undefined' && window.location.hostname.includes('decentraguild.com')) {
    basePath = '/'
  }
  
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
