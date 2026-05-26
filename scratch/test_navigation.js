// Deno script to test navigation, menu clicks, and canonical links in Chrome
const DEV_SERVER_URL = "http://localhost:5174";

async function main() {
  console.log("🔍 Fetching active Chrome targets...");
  const res = await fetch("http://localhost:9222/json");
  const targets = await res.json();
  
  // Find a target that is either about:blank or our dev server or the production site
  const pageTarget = targets.find(t => t.type === "page");
  if (!pageTarget) {
    console.error("❌ No active page tab found in Chrome!");
    return;
  }
  
  console.log(`🔌 Connecting to target tab: "${pageTarget.title}" (${pageTarget.url})`);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  
  let msgId = 1;
  const pendingCommands = new Map();
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingCommands.has(data.id)) {
      const resolve = pendingCommands.get(data.id);
      pendingCommands.delete(data.id);
      resolve(data.result);
    }
  };
  
  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pendingCommands.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  
  // Wait for WebSocket connection to open
  await new Promise((resolve) => {
    ws.onopen = resolve;
  });
  console.log("✅ WebSocket connected!");
  
  // Enable Page and Runtime domains
  await sendCommand("Page.enable");
  await sendCommand("Runtime.enable");
  
  // Helper to evaluate JS in the page
  async function evaluate(expression) {
    const res = await sendCommand("Runtime.evaluate", {
      expression,
      returnByValue: true
    });
    return res?.result?.value;
  }
  
  // Helper to wait
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
  // Navigate to Dev Server
  console.log(`\n🚀 Navigating to ${DEV_SERVER_URL}/`);
  await sendCommand("Page.navigate", { url: `${DEV_SERVER_URL}/` });
  await delay(3000); // Wait for load and React hydration
  
  let currentUrl = await evaluate("window.location.href");
  let canonical = await evaluate("document.querySelector('link[rel=\"canonical\"]')?.href");
  console.log(`📍 Current URL: ${currentUrl}`);
  console.log(`🔗 Canonical:   ${canonical}`);
  
  // Test redirect: /Katalog (uppercase) -> /katalog (lowercase)
  console.log(`\n🔄 Testing redirect: ${DEV_SERVER_URL}/Katalog`);
  await sendCommand("Page.navigate", { url: `${DEV_SERVER_URL}/Katalog` });
  await delay(2000);
  currentUrl = await evaluate("window.location.href");
  canonical = await evaluate("document.querySelector('link[rel=\"canonical\"]')?.href");
  console.log(`📍 Current URL: ${currentUrl}`);
  console.log(`🔗 Canonical:   ${canonical}`);
  if (currentUrl.endsWith("/katalog")) {
    console.log("✅ SUCCESS: Redirected /Katalog -> /katalog correctly!");
  } else {
    console.error("❌ FAILURE: Did not redirect to lowercase /katalog!");
  }
  
  // Click through menu items
  console.log("\n🖱️ Finding main navigation menu items...");
  const menuLinks = await evaluate(`
    Array.from(document.querySelectorAll('nav a, header a, footer a'))
      .map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }))
      .filter(l => l.text && l.href && l.href.startsWith('/') && !l.href.includes(':'))
  `);
  
  // Filter unique paths
  const uniquePaths = [];
  const seenPaths = new Set();
  for (const link of menuLinks) {
    const cleanPath = link.href.split('?')[0];
    if (!seenPaths.has(cleanPath)) {
      seenPaths.add(cleanPath);
      uniquePaths.push(link);
    }
  }
  
  console.log(`Found ${uniquePaths.length} unique internal pages in menus/header:`);
  for (const page of uniquePaths) {
    console.log(`  - "${page.text}" -> ${page.href}`);
  }
  
  // Click through a few main pages
  const testPaths = ['/katalog', '/o-nas', '/kontakt', '/ako-to-funguje', '/blog', '/faq'];
  
  for (const targetPath of testPaths) {
    console.log(`\n🚶 Navigating to path: ${targetPath}`);
    await sendCommand("Page.navigate", { url: `${DEV_SERVER_URL}${targetPath}` });
    await delay(2000);
    
    currentUrl = await evaluate("window.location.href");
    canonical = await evaluate("document.querySelector('link[rel=\"canonical\"]')?.href");
    const h1Text = await evaluate("document.querySelector('h1')?.innerText?.trim()");
    
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`🔗 Canonical:   ${canonical}`);
    console.log(`📝 H1 Header:   "${h1Text || 'none'}"`);
    
    if (canonical && canonical.includes("www.americanliving.sk")) {
      console.error("❌ Warning: Canonical contains 'www'!");
    } else if (canonical && canonical === `https://americanliving.sk${targetPath}`) {
      console.log("✅ Canonical is correct (non-www and lowercase).");
    } else {
      console.log(`ℹ️ Canonical is: ${canonical}`);
    }
  }
  
  console.log("\n🎉 Testing completed successfully!");
  ws.close();
}

main().catch(console.error);
