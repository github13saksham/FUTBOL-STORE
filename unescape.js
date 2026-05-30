const fs = require('fs');
let base = fs.readFileSync('checkout_base.tsx', 'utf8');
if (base.startsWith('"') && base.endsWith('"')) {
   let unescaped = base.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
   fs.writeFileSync('checkout_base.tsx', unescaped);
   console.log('Unescaped checkout_base.tsx!');
}
