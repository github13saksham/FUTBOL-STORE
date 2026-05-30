const fs = require('fs');

function restoreFile(txtPath, outPath) {
  if (!fs.existsSync(txtPath)) return false;
  const content = fs.readFileSync(txtPath, 'utf8');
  
  const lines = content.split('\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('The following code has been modified')) startIdx = i + 1;
    if (lines[i].includes('The above content')) endIdx = i;
  }
  
  if (startIdx !== -1 && endIdx !== -1) {
    const codeLines = lines.slice(startIdx, endIdx);
    const cleaned = codeLines.map(line => {
      // Remove prefix like "12: "
      const idx = line.indexOf(': ');
      if (idx !== -1 && idx < 6) { // line numbers are small
        return line.slice(idx + 2);
      }
      return line;
    }).join('\n');
    
    fs.writeFileSync(outPath, cleaned);
    console.log('Restored', outPath);
    return true;
  } else {
    // maybe it wasn't modified with line numbers
    if (content.length > 0) {
      // just extract whatever was in the output property if it was a raw JSON output
      console.log('Could not find boundaries in', txtPath);
    }
  }
  return false;
}

restoreFile('prod_restore.txt', 'src/app/product/[id]/page.tsx');
restoreFile('checkout_restore.txt', 'src/app/checkout/page.tsx');
restoreFile('about_restore.txt', 'src/app/about-us/page.tsx');
