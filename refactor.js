const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // To handle the light/dark context, we could try to just look at common patterns.
  // Actually, in Futbol Store:
  // - text-luxury-ivory, text-luxury-sand, text-luxury-cream are ALWAYS on dark backgrounds -> text-white
  // - text-luxury-dark, text-luxury-charcoal are ALWAYS on light backgrounds -> text-black
  // - text-luxury-taupe is used on BOTH.
  
  // Let's replace the unambiguous ones first globally:
  content = content.replace(/text-luxury-(ivory|sand|cream|sage)(\/\d+)?/g, 'text-white');
  content = content.replace(/text-luxury-(dark|charcoal)(\/\d+)?/g, 'text-black');
  
  // Hover states:
  content = content.replace(/hover:text-luxury-(ivory|sand|cream|sage)(\/\d+)?/g, 'hover:text-white/60');
  content = content.replace(/hover:text-luxury-(dark|charcoal)(\/\d+)?/g, 'hover:text-black/60');
  
  fs.writeFileSync(filePath, content, 'utf8');
};

const walk = (dir) => {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('about-us')) { // skip about-us as it's already done
      processFile(fullPath);
    }
  });
};

walk('./src');
console.log('Unambiguous colors replaced.');
