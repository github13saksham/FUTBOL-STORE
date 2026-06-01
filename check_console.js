const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST_FAILED:', request.url(), request.failure().errorText);
  });
  page.on('response', response => {
    if (!response.ok()) {
      console.log('RESPONSE_ERROR:', response.url(), response.status());
    }
  });

  console.log('Navigating to http://localhost:3000...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('Page loaded. Waiting a few seconds...');
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.error('Failed to load page', e);
  }

  await browser.close();
})();
