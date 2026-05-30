const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // replace text-luxury-taupe with text-black
  content = content.replace(/text-luxury-taupe(\/\d+)?/g, 'text-black');
  content = content.replace(/hover:text-luxury-taupe(\/\d+)?/g, 'hover:text-black/60');
  
  // fix any remaining luxury text colors that might have been missed
  content = content.replace(/text-luxury-[a-z]+(\/\d+)?/g, 'text-black');
  
  fs.writeFileSync(filePath, content, 'utf8');
};

const walk = (dir) => {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('about-us')) { // skip about-us
      processFile(fullPath);
    }
  });
};

walk('./src');
console.log('Taupe and remaining luxury text replaced.');
