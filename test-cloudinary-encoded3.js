const https = require('https');

const rawSrc = 'https://firebasestorage.googleapis.com/v0/b/futbol-store-289db.appspot.com/o/products%2Fajax-25-26-third-player-version.jpg?alt=media';

// Only encode the query params part to prevent Cloudinary from stripping it
const encodedSrc = rawSrc.replace('?', '%3F').replace('=', '%3D').replace('&', '%26');

const testUrl = `https://res.cloudinary.com/dev9ldgon/image/fetch/f_auto,q_auto/${encodedSrc}`;

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
