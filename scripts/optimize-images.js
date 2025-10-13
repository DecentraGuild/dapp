/**
 * Image Optimization Script for dGuild dApp
 * 
 * This script helps convert PNG/JPG images to WebP format for better performance.
 * 
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * 
 * Usage:
 * - Run: node scripts/optimize-images.js
 * 
 * This will:
 * 1. Find all PNG/JPG images in public/SLP
 * 2. Convert them to WebP format
 * 3. Save WebP versions alongside originals
 * 4. Generate a report of space savings
 */

import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SLP_DIR = join(__dirname, '..', 'public', 'SLP')
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg']

// Statistics
const stats = {
  total: 0,
  converted: 0,
  failed: 0,
  originalSize: 0,
  webpSize: 0
}

async function getAllFiles(dir) {
  const files = []
  const items = await readdir(dir)

  for (const item of items) {
    const fullPath = join(dir, item)
    const itemStat = await stat(fullPath)

    if (itemStat.isDirectory()) {
      const subFiles = await getAllFiles(fullPath)
      files.push(...subFiles)
    } else if (IMAGE_EXTENSIONS.includes(extname(item).toLowerCase())) {
      files.push(fullPath)
    }
  }

  return files
}

async function convertToWebP(imagePath) {
  try {
    const ext = extname(imagePath)
    const webpPath = imagePath.replace(ext, '.webp')

    // Get original file size
    const originalBuffer = await readFile(imagePath)
    const originalSize = originalBuffer.length

    // Convert to WebP
    const webpBuffer = await sharp(imagePath)
      .webp({ quality: 80, effort: 6 }) // Good balance of quality and file size
      .toBuffer()

    // Save WebP version
    await writeFile(webpPath, webpBuffer)

    const webpSize = webpBuffer.length
    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1)

    console.log(`✓ ${basename(imagePath)} → ${basename(webpPath)} (${savings}% smaller)`)

    stats.converted++
    stats.originalSize += originalSize
    stats.webpSize += webpSize

    return true
  } catch (error) {
    console.error(`✗ Failed to convert ${basename(imagePath)}:`, error.message)
    stats.failed++
    return false
  }
}

async function main() {
  console.log('🖼️  Image Optimization Started\n')
  console.log(`Scanning: ${SLP_DIR}\n`)

  try {
    // Get all image files
    const imageFiles = await getAllFiles(SLP_DIR)
    stats.total = imageFiles.length

    if (imageFiles.length === 0) {
      console.log('No images found to optimize.')
      return
    }

    console.log(`Found ${imageFiles.length} images to convert\n`)

    // Convert all images
    for (const imagePath of imageFiles) {
      await convertToWebP(imagePath)
    }

    // Print summary
    console.log('\n📊 Optimization Summary:')
    console.log('─'.repeat(50))
    console.log(`Total images:     ${stats.total}`)
    console.log(`Converted:        ${stats.converted}`)
    console.log(`Failed:           ${stats.failed}`)
    console.log(`Original size:    ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`WebP size:        ${(stats.webpSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Total savings:    ${((1 - stats.webpSize / stats.originalSize) * 100).toFixed(1)}%`)
    console.log(`Space saved:      ${((stats.originalSize - stats.webpSize) / 1024 / 1024).toFixed(2)} MB`)
    console.log('─'.repeat(50))
    console.log('\n✅ Image optimization complete!')
    console.log('\n💡 Next steps:')
    console.log('1. Update image references in JSON files to use .webp extension')
    console.log('2. Test the app to ensure WebP images load correctly')
    console.log('3. Consider removing original PNG/JPG files to save space')

  } catch (error) {
    console.error('Error during optimization:', error)
    process.exit(1)
  }
}

main()

