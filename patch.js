const fs = require('fs');
const img = fs.readFileSync('./public/images/razorpay-logo.jpeg');
const base64Img = 'data:image/jpeg;base64,' + img.toString('base64');
let code = fs.readFileSync('./src/app/checkout/page.tsx', 'utf8');
code = code.replace('image: window.location.origin + "/images/razorpay-logo.jpeg",', 'image: "' + base64Img + '",');
code = code.replace('color: "#73D2F3",', 'color: "#FFFFFF",');
fs.writeFileSync('./src/app/checkout/page.tsx', code);
