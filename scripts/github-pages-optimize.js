import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLP_DIR = path.join(__dirname, '..', 'public', 'SLP');
const BACKUP_DIR = path.join(__dirname, '..', 'public', 'SLP_backup');

console.log('🚀 Optimizing for GitHub Pages...');

// Function to optimize JSON for GitHub Pages
function optimizeForGitHubPages(obj) {
    const optimized = { ...obj };
    
    // Remove redundant fields that can be looked up
    if (optimized.guildName && optimized.guildId) {
        delete optimized.guildName;
    }
    
    // Shorten field names for better compression
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
        'walletID': 'wid',
        'guildProfile': 'profile',
        'financialSummary': 'summary',
        'vaultActions': 'actions',
        'questSummary': 'quests',
        'goalsSummary': 'goals',
        'eventsSummary': 'events',
        'foundrySummary': 'foundry',
        'minigameSummary': 'games',
        'votingSummary': 'voting',
        'guildOverview': 'overview'
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

// Function to consolidate related files
function consolidateBalanceFiles() {
    const balanceDir = path.join(SLP_DIR, 'balance');
    const balanceFiles = fs.readdirSync(balanceDir).filter(file => file.endsWith('.json') && !file.includes('consolidated'));
    
    const guildBalances = {};
    
    balanceFiles.forEach(file => {
        const filePath = path.join(balanceDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        const guildId = data.gid || data.guildID || data.guildId;
        if (!guildId) return;
        
        if (!guildBalances[guildId]) {
            guildBalances[guildId] = {
                gid: guildId,
                ts: data.ts || data.lastUpdated,
                vaults: {}
            };
        }
        
        const vaultType = file.replace(`${guildId}_`, '').replace('_balance.json', '');
        guildBalances[guildId].vaults[vaultType] = {
            vid: data.vid || data.vaultID,
            tokens: data.tokens,
            nfts: data.nfts,
            ts: data.ts || data.lastUpdated
        };
    });
    
    // Write consolidated files
    Object.entries(guildBalances).forEach(([guildId, data]) => {
        const consolidatedPath = path.join(balanceDir, `${guildId}_consolidated_balances.json`);
        const minified = JSON.stringify(data);
        fs.writeFileSync(consolidatedPath, minified);
        console.log(`✅ Consolidated balance for ${guildId}: ${(minified.length / 1024).toFixed(2)} KB`);
    });
}

// Function to process a single file
function processFile(filePath, relativePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');
        
        // Parse and optimize
        const parsed = JSON.parse(content);
        const optimized = optimizeForGitHubPages(parsed);
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
console.log('📁 Processing directory:', SLP_DIR);
console.log('💾 Backup directory:', BACKUP_DIR);

// Consolidate balance files first
consolidateBalanceFiles();

// Process all JSON files
const results = processDirectory(SLP_DIR);

// Calculate totals
const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
const totalSavings = totalOriginal - totalOptimized;
const totalSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

console.log('\n📊 GitHub Pages Optimization Results:');
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

console.log('\n✅ GitHub Pages optimization complete!');
console.log('📝 Note: GitHub Pages will automatically gzip these files when serving');
