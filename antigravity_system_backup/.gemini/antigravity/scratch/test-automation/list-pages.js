const puppeteer = require('puppeteer-core');

async function main() {
  const wsUrl = process.env.AGY_BROWSER_WS_URL;
  if (!wsUrl) {
    console.error("AGY_BROWSER_WS_URL environment variable is not defined!");
    process.exit(1);
  }

  console.log("Connecting to browser at:", wsUrl);
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl,
    defaultViewport: null
  });

  console.log("Connected successfully!");
  const pages = await browser.pages();
  console.log(`Found ${pages.length} open pages:`);
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    try {
      console.log(`[Page ${i}] URL: ${page.url()} | Title: ${await page.title()}`);
    } catch (e) {
      console.log(`[Page ${i}] Error getting details: ${e.message}`);
    }
  }

  await browser.disconnect();
}

main().catch(console.error);
