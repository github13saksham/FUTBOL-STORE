const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code/User/History');
if (!fs.existsSync(historyDir)) {
    console.log("History directory not found.");
    process.exit(1);
}

const targetTime = new Date();
targetTime.setHours(2, 22, 0, 0); // 2:22 AM today
const targetMs = targetTime.getTime();

console.log(`Target time: ${targetTime.toISOString()} (${targetMs})`);

const projectPath = 'c:/Users/SAKSHAM/Downloads/Futbol Store'.toLowerCase().replace(/\\/g, '/');

const dirs = fs.readdirSync(historyDir);
const recoveries = [];

for (const dir of dirs) {
    const dirPath = path.join(historyDir, dir);
    const entriesFile = path.join(dirPath, 'entries.json');
    
    if (fs.existsSync(entriesFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
            if (!data.resource) continue;
            
            // e.g. file:///c%3A/Users/SAKSHAM/Downloads/Futbol%20Store/src/app/page.tsx
            const resourcePath = decodeURIComponent(data.resource.replace('file:///', '')).toLowerCase().replace(/\\/g, '/');
            
            if (resourcePath.includes(projectPath)) {
                // This folder belongs to a file in our project!
                const relativePath = resourcePath.split('futbol store/')[1];
                if (!relativePath || !relativePath.endsWith('.tsx')) continue;
                
                // Find the entry closest to but NOT AFTER our target time
                // Or maybe just the closest entry to 2:22 AM
                let bestEntry = null;
                let minDiff = Infinity;
                
                for (const entry of data.entries) {
                    const diff = Math.abs(entry.timestamp - targetMs);
                    if (diff < minDiff && diff < 30 * 60 * 1000) { // Within 30 minutes of 2:22 AM
                        minDiff = diff;
                        bestEntry = entry;
                    }
                }
                
                if (bestEntry) {
                    const backupFile = path.join(dirPath, bestEntry.id);
                    if (fs.existsSync(backupFile)) {
                        recoveries.push({
                            dest: relativePath,
                            src: backupFile,
                            time: new Date(bestEntry.timestamp).toLocaleString()
                        });
                    }
                }
            }
        } catch (e) {
            // ignore parse errors
        }
    }
}

if (recoveries.length === 0) {
    console.log("No valid history found around 2:22 AM.");
} else {
    console.log(`Found ${recoveries.length} files to recover from VS Code History!`);
    for (const rec of recoveries) {
        console.log(`Recovering ${rec.dest} from ${rec.time}...`);
        const content = fs.readFileSync(rec.src, 'utf8');
        const destPath = path.join('C:/Users/SAKSHAM/Downloads/Futbol Store', rec.dest);
        
        // Ensure directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        
        fs.writeFileSync(destPath, content);
    }
    console.log("Recovery complete!");
}
