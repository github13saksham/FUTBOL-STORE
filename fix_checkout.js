const fs = require('fs');
const content = fs.readFileSync('src/app/checkout/page.tsx', 'utf8');
if (content.startsWith('"') && content.endsWith('"')) {
    let unescaped = content.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
    fs.writeFileSync('src/app/checkout/page.tsx', unescaped);
    console.log('Unescaped checkout page!');
} else {
    console.log('Checkout page is already unescaped.');
}
