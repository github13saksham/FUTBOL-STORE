const fs = require('fs');
let content = fs.readFileSync('src/app/checkout/page.tsx', 'utf8').trim();
if (content.startsWith('"') && content.endsWith('"')) {
    const unescaped = JSON.parse(content);
    fs.writeFileSync('src/app/checkout/page.tsx', unescaped);
    console.log('Unescaped checkout page successfully!');
} else {
    console.log('Not double quoted.');
}
