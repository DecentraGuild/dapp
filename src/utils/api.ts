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

/**
 * Enhanced cache for SLP data with longer TTL and session persistence
 */
class SlpDataCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly TTL = 60 * 60 * 1000 // 1 hour (increased from 5 minutes)

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
  
  // Get cache statistics for debugging
  getStats(): { size: number; entries: number } {
    let size = 0
    this.cache.forEach((value) => {
      size += JSON.stringify(value.data).length
    })
    return {
      size: Math.round(size / 1024), // Size in KB
      entries: this.cache.size
    }
  }
}

const slpCache = new SlpDataCache()

/**
 * Load SLP data with caching for better performance
 */
export async function loadSlpData<T = any>(path: string): Promise<T | null> {
  const fullPath = getSlpPath(path)
  
  // Check cache first
  const cached = slpCache.get(fullPath)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(fullPath)
    if (!response.ok) {
      // Handle failed SLP data load silently
      return null
    }
    
    const data = await response.json()
    
    // Cache the result
    slpCache.set(fullPath, data)
    
    return data
  } catch (error) {
    // Handle error silently in production
    // Could implement proper error handling/notification system here
    return null
  }
}

/**
 * Load multiple SLP files in parallel with concurrency control
 * Uses batching to prevent overwhelming GitHub Pages with too many simultaneous requests
 */
export async function loadMultipleSlpData<T = any>(
  paths: string[], 
  batchSize: number = 6 // GitHub Pages works best with 4-6 concurrent requests
): Promise<T[]> {
  const loadedData: T[] = []
  
  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize)
    const promises = batch.map(path => loadSlpData<T>(path))
    const results = await Promise.allSettled(promises)
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value !== null) {
        loadedData.push(result.value)
      }
    }
  }
  
  return loadedData
}

/**
 * Clear the SLP data cache
 */
export function clearSlpCache(): void {
  slpCache.clear()
}