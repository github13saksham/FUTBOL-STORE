const https = require('https');

const testUrl = 'https://res.cloudinary.com/dev9ldgon/image/fetch/f_auto,q_auto/https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';

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
