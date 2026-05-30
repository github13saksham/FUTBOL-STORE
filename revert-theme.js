const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  if (filePath.includes('checkout') || filePath.includes('product')) {
    // Revert the dark aesthetic redesign for these specific pages
    content = content.replace(/bg-\[\#0B0B0C\]/g, 'bg-[#FFEEE2]');
    content = content.replace(/bg-\[\#141414\]/g, 'bg-transparent');
    
    // Borders
    content = content.replace(/border-white\/(10|20)/g, 'border-luxury-taupe/20');
    content = content.replace(/border-white\/50/g, 'border-luxury-taupe/50');
    
    // Text colors
    content = content.replace(/text-white\/40/g, 'text-luxury-taupe/60');
    content = content.replace(/text-white\/50/g, 'text-luxury-taupe');
    content = content.replace(/text-white\/60/g, 'text-luxury-dark/60');
    content = content.replace(/text-white\/80/g, 'text-luxury-dark/80');
    content = content.replace(/text-white/g, 'text-luxury-dark');
    
    // Buttons (assuming standard white buttons were added in dark mode)
    content = content.replace(/bg-white text-black hover:bg-neutral-200/g, 'bg-luxury-dark text-luxury-ivory hover:bg-luxury-taupe hover:text-luxury-dark');
    content = content.replace(/bg-white text-black/g, 'bg-luxury-dark text-luxury-ivory');
    
    // Some product page specific highlights might have been set to black/white
    content = content.replace(/text-luxury-ivory/g, 'text-luxury-dark');
  } else {
    // For other files, revert the recent typography simplification
    content = content.replace(/text-white/g, 'text-luxury-ivory');
    content = content.replace(/text-black/g, 'text-luxury-dark');
    content = content.replace(/hover:text-luxury-dark\/60/g, 'hover:text-luxury-taupe');
    content = content.replace(/hover:text-luxury-ivory\/60/g, 'hover:text-luxury-sand');
  }
  
  // Also fix about-us
  if (filePath.includes('about-us')) {
    content = content.replace(/bg-black/g, 'bg-luxury-dark');
    content = content.replace(/text-white/g, 'text-luxury-ivory');
    content = content.replace(/text-black/g, 'text-luxury-dark');
    content = content.replace(/border-white\/10/g, 'border-luxury-sand/10');
    content = content.replace(/bg-white\/10/g, 'bg-luxury-sand/10');
  }

  // Restore the original taupe hover effects universally
  content = content.replace(/hover:text-luxury-dark\/60/g, 'hover:text-luxury-taupe');
  content = content.replace(/hover:text-luxury-ivory\/60/g, 'hover:text-luxury-taupe');

  fs.writeFileSync(filePath, content, 'utf8');
};

const walk = (dir) => {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  });
};

walk('./src');
console.log('Site reverted to original theme.');
