import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SLP_DIR = path.join(__dirname, '..', 'public', 'SLP');
const BACKUP_DIR = path.join(__dirname, '..', 'public', 'SLP_backup');

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Function to minify JSON
function minifyJson(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed);
    } catch (error) {
        console.error('Error parsing JSON:', error.message);
        return jsonString;
    }
}

// Function to remove redundant fields
function removeRedundantFields(obj) {
    const optimized = { ...obj };
    
    // Remove redundant guild names (can be looked up)
    if (optimized.guildName && optimized.guildId) {
        delete optimized.guildName;
    }
    
    // Remove redundant guild descriptions in nested objects
    if (optimized.guildProfile && optimized.guildProfile.description && optimized.guildId) {
        delete optimized.guildProfile.description;
    }
    
    // Shorten common field names
    const fieldMappings = {
        'notificationSettings': 'notif',
        'lastUpdated': 'ts',
        'createdAt': 'created',
        'updatedAt': 'updated',
        'memberID': 'mid',
        'guildID': 'gid',
        'eventID': 'eid',
        'questID': 'qid',
        'vaultID': 'vid',
        'walletID': 'wid'
    };
    
    function shortenFields(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(shortenFields);
        }
        
        const shortened = {};
        for (const [key, value] of Object.entries(obj)) {
            const newKey = fieldMappings[key] || key;
            shortened[newKey] = shortenFields(value);
        }
        return shortened;
    }
    
    return shortenFields(optimized);
}

// Function to process a single file
function processFile(filePath, relativePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');
        
        // Parse and optimize
        const parsed = JSON.parse(content);
        const optimized = removeRedundantFields(parsed);
        const minified = JSON.stringify(optimized);
        const optimizedSize = Buffer.byteLength(minified, 'utf8');
        
        // Create backup
        const backupPath = path.join(BACKUP_DIR, relativePath);
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        fs.writeFileSync(backupPath, content);
        
        // Write optimized version
        fs.writeFileSync(filePath, minified);
        
        const savings = originalSize - optimizedSize;
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
        
        return {
            file: relativePath,
            originalSize,
            optimizedSize,
            savings,
            savingsPercent
        };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return null;
    }
}

// Function to recursively process all JSON files
function processDirectory(dir, relativeDir = '') {
    const results = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(relativeDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            results.push(...processDirectory(fullPath, relativePath));
        } else if (item.endsWith('.json')) {
            const result = processFile(fullPath, relativePath);
            if (result) {
                results.push(result);
            }
        }
    }
    
    return results;
}

// Main execution
console.log('🚀 Starting JSON optimization...');
console.log(`📁 Processing directory: ${SLP_DIR}`);
console.log(`💾 Backup directory: ${BACKUP_DIR}`);

const results = processDirectory(SLP_DIR);

// Calculate totals
const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
const totalSavings = totalOriginal - totalOptimized;
const totalSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

console.log('\n📊 Optimization Results:');
console.log('='.repeat(50));
console.log(`📁 Files processed: ${results.length}`);
console.log(`📏 Original size: ${(totalOriginal / 1024).toFixed(2)} KB`);
console.log(`📏 Optimized size: ${(totalOptimized / 1024).toFixed(2)} KB`);
console.log(`💾 Space saved: ${(totalSavings / 1024).toFixed(2)} KB (${totalSavingsPercent}%)`);

console.log('\n🏆 Top 10 files with biggest savings:');
results
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 10)
    .forEach((result, index) => {
        console.log(`${index + 1}. ${result.file}: ${(result.savings / 1024).toFixed(2)} KB (${result.savingsPercent}%)`);
    });

console.log('\n✅ Optimization complete!');
console.log(`💾 Original files backed up to: ${BACKUP_DIR}`);
