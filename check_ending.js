const fs = require('fs');
let base = fs.readFileSync('checkout_base.tsx', 'utf8').trim();
console.log('Starts with quote:', base.startsWith('"'));
console.log('Ends with quote:', base.endsWith('"'));
console.log('Last 20 chars:', base.slice(-20));
