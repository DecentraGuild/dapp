import { getSlpPath } from './api'

// Cache for SVG path data and parsed SVG documents
const pathCache = new Map<string, string>()
const svgDocumentCache = new Map<string, Document>()
const svgLoadPromises = new Map<string, Promise<Document>>()

async function loadSvgDocument(svgFile: string): Promise<Document> {
  // Check if we already have this SVG document cached
  if (svgDocumentCache.has(svgFile)) {
    return svgDocumentCache.get(svgFile)!
  }
  
  // Check if we're already loading this SVG file
  if (svgLoadPromises.has(svgFile)) {
    return svgLoadPromises.get(svgFile)!
  }
  
  // Start loading the SVG file
  const loadPromise = (async () => {
    try {
      // Convert SLP path to correct GitHub Pages path
      const correctedSvgFile = svgFile.startsWith('/SLP/') ? getSlpPath(svgFile.replace('/SLP/', '')) : svgFile
      console.log('Loading SVG file:', correctedSvgFile)
      const response = await fetch(correctedSvgFile)
      
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status}`)
      }
      
      const svgText = await response.text()
      const parser = new DOMParser()
      const svgDocument = parser.parseFromString(svgText, 'image/svg+xml')
      
      // Cache the document
      svgDocumentCache.set(svgFile, svgDocument)
      
      return svgDocument
    } catch (error) {
      console.error('Error loading SVG file:', error)
      throw error
    } finally {
      // Remove the promise from the loading map
      svgLoadPromises.delete(svgFile)
    }
  })()
  
  // Cache the promise
  svgLoadPromises.set(svgFile, loadPromise)
  
  return loadPromise
}

export async function getShapePath(shapeId: string, svgFile: string): Promise<string> {
  const cacheKey = `${svgFile}-${shapeId}`
  
  if (pathCache.has(cacheKey)) {
    return pathCache.get(cacheKey)!
  }

  try {
    const svgDoc = await loadSvgDocument(svgFile)
    
    // Find the path element with the matching ID
    const pathElement = svgDoc.querySelector(`path[id="${shapeId}"]`)
    
    if (pathElement) {
      const pathData = pathElement.getAttribute('d')
      if (pathData) {
        console.log(`Found shape path for ${shapeId} in ${svgFile}`)
        pathCache.set(cacheKey, pathData)
        return pathData
      }
    }
    
    // Fallback: return a simple rectangle if shape not found
    console.warn(`Shape with ID "${shapeId}" not found in SVG file: ${svgFile}`)
    const fallbackPath = "M10,10 L90,10 L90,50 L10,50 Z"
    pathCache.set(cacheKey, fallbackPath)
    return fallbackPath
    
  } catch (error) {
    console.error(`Error loading shape path for "${shapeId}" from "${svgFile}":`, error)
    const fallbackPath = "M10,10 L90,10 L90,50 L10,50 Z"
    pathCache.set(cacheKey, fallbackPath)
    return fallbackPath
  }
}

export function preloadShapePaths(svgFile: string, shapeIds: string[]): Promise<void[]> {
  return Promise.all(
    shapeIds.map(shapeId => getShapePath(shapeId, svgFile))
  ).then(() => [])
}
