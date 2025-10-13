import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLP_DIR = path.join(__dirname, '..', 'public', 'SLP');

console.log('🗜️ Creating gzip versions of JSON files...');

let totalOriginal = 0;
let totalGzipped = 0;
let filesProcessed = 0;

function processDirectory(dir, relativeDir = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(relativeDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath, relativePath);
        } else if (item.endsWith('.json')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const gzipped = gzipSync(content);
                
                const gzipPath = fullPath + '.gz';
                fs.writeFileSync(gzipPath, gzipped);
                
                totalOriginal += content.length;
                totalGzipped += gzipped.length;
                filesProcessed++;
                
                const savings = ((content.length - gzipped.length) / content.length * 100).toFixed(1);
                console.log(`✅ ${relativePath}: ${(content.length / 1024).toFixed(2)} KB → ${(gzipped.length / 1024).toFixed(2)} KB (${savings}% saved)`);
            } catch (error) {
                console.error(`❌ Error processing ${relativePath}:`, error.message);
            }
        }
    }
}

processDirectory(SLP_DIR);

const totalSavings = totalOriginal - totalGzipped;
const totalSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

console.log('\n📊 Gzip Compression Results:');
console.log('='.repeat(50));
console.log(`📁 Files processed: ${filesProcessed}`);
console.log(`📏 Original size: ${(totalOriginal / 1024).toFixed(2)} KB`);
console.log(`📏 Gzipped size: ${(totalGzipped / 1024).toFixed(2)} KB`);
console.log(`💾 Space saved: ${(totalSavings / 1024).toFixed(2)} KB (${totalSavingsPercent}%)`);

console.log('\n✅ Gzip compression complete!');
