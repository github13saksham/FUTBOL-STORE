const https = require('https');

const rawSrc = 'https://firebasestorage.googleapis.com/v0/b/futbol-store-289db.appspot.com/o/products%2Fajax-25-26-third-player-version.jpg?alt=media';
const b64Src = Buffer.from(rawSrc).toString('base64');
const testUrl = `https://res.cloudinary.com/dev9ldgon/image/fetch/f_auto,q_auto/b64:${b64Src}`;

https.get(testUrl, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  if (res.statusCode !== 200) {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Body: ${data}`));
  } else {
    console.log("Success! Image fetched correctly.");
  }
}).on('error', (e) => {
  console.error(e);
});
