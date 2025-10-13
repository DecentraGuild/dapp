import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLP_DIR = path.join(__dirname, '..', 'public', 'SLP');
const BALANCE_DIR = path.join(SLP_DIR, 'balance');

console.log('🔄 Consolidating balance files...');

// Get all balance files
const balanceFiles = fs.readdirSync(BALANCE_DIR).filter(file => file.endsWith('.json'));

// Group by guild
const guildBalances = {};

balanceFiles.forEach(file => {
    const filePath = path.join(BALANCE_DIR, file);
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
    
    // Extract vault type from filename
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
    const consolidatedPath = path.join(BALANCE_DIR, `${guildId}_consolidated_balances.json`);
    const minified = JSON.stringify(data);
    
    // Write minified version
    fs.writeFileSync(consolidatedPath, minified);
    
    // Create gzip version
    const gzipped = gzipSync(minified);
    const gzipPath = path.join(BALANCE_DIR, `${guildId}_consolidated_balances.json.gz`);
    fs.writeFileSync(gzipPath, gzipped);
    
    console.log(`✅ Created consolidated balance for ${guildId}: ${(minified.length / 1024).toFixed(2)} KB (gzip: ${(gzipped.length / 1024).toFixed(2)} KB)`);
});

console.log('🎉 Balance consolidation complete!');
