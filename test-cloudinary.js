const https = require('https');

const testUrl = 'https://res.cloudinary.com/dev9ldgon/image/fetch/f_auto,q_auto/https://firebasestorage.googleapis.com/v0/b/futbol-store-289db.appspot.com/o/products%2Fajax-25-26-third-player-version.jpg?alt=media';

https.get(testUrl, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  if (res.statusCode !== 200) {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Body: ${data}`));
  }
}).on('error', (e) => {
  console.error(e);
});
