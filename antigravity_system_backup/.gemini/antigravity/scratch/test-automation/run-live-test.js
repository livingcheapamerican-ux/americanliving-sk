const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');

const ARTIFACT_DIR = '/Users/richardkovac/.gemini/antigravity/brain/1e41324a-681c-483e-9052-4c6b02035c9d';
const PORT = 9228;
const USER_DATA_DIR = '/Users/richardkovac/.gemini/antigravity/scratch/chrome-profile';

async function findAndClickElement(page, text) {
  console.log(`Searching for element containing "${text}" in all frames...`);
  let found = null;
  
  for (const frame of page.frames()) {
    try {
      const handle = await frame.evaluateHandle((txt) => {
        const elements = document.querySelectorAll('button, a, div, span, p, li, h1, h2, h3, h4, h5, td');
        for (const el of elements) {
          // Exclude our overlays
          if (el.id === 'ai-status-banner' || el.closest('#ai-status-banner') || 
              el.id === 'ai-mouse-cursor' || el.closest('#ai-mouse-cursor')) {
            continue;
          }
          if (el.textContent && el.textContent.trim().toLowerCase().includes(txt.toLowerCase())) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              return el;
            }
          }
        }
        return null;
      }, text);
      
      const element = handle.asElement();
      if (element) {
        found = { frame, element };
        break;
      }
    } catch (e) {
      // Cross-origin or other errors
    }
  }

  if (!found) {
    console.log(`❌ Element containing "${text}" not found in any frame.`);
    return false;
  }

  try {
    const box = await found.element.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      console.log(`🎯 Found element. Animating cursor to (x:${Math.round(cx)}, y:${Math.round(cy)})...`);
      
      // Move visual cursor on main page
      await page.evaluate((x, y) => {
        let cursor = document.getElementById('ai-mouse-cursor');
        if (!cursor) {
          cursor = document.createElement('div');
          cursor.id = 'ai-mouse-cursor';
          cursor.style.position = 'fixed';
          cursor.style.width = '24px';
          cursor.style.height = '24px';
          cursor.style.borderRadius = '50%';
          cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.85)';
          cursor.style.border = '3px solid white';
          cursor.style.boxShadow = '0 0 12px rgba(0,0,0,0.6)';
          cursor.style.pointerEvents = 'none';
          cursor.style.zIndex = '99999999';
          cursor.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
          cursor.style.left = '0px';
          cursor.style.top = '0px';
          
          const pointer = document.createElement('div');
          pointer.style.position = 'absolute';
          pointer.style.width = '8px';
          pointer.style.height = '8px';
          pointer.style.backgroundColor = 'white';
          pointer.style.borderRadius = '50%';
          pointer.style.top = '5px';
          pointer.style.left = '5px';
          cursor.appendChild(pointer);
          
          document.body.appendChild(cursor);
        }
        cursor.style.left = `${x - 12}px`;
        cursor.style.top = `${y - 12}px`;
      }, cx, cy).catch(() => {});
      
      await new Promise(r => setTimeout(r, 900));
      
      // Animate click
      await page.evaluate(() => {
        let cursor = document.getElementById('ai-mouse-cursor');
        if (cursor) {
          cursor.style.transform = 'scale(0.7)';
          setTimeout(() => { cursor.style.transform = 'scale(1)'; }, 150);
        }
      }).catch(() => {});
      
      await found.element.click();
      console.log(`✅ Clicked element.`);
      return true;
    }
  } catch (err) {
    console.error(`Error clicking element:`, err);
  }
  
  return false;
}

async function dumpAllTextsInFrames(page) {
  let allTexts = [];
  for (const frame of page.frames()) {
    try {
      const texts = await frame.evaluate(() => {
        const elements = document.querySelectorAll('button, a, div, span, p, li, h1, h2, h3, h4, h5, td');
        const res = [];
        for (const el of elements) {
          if (el.textContent && el.textContent.trim().length > 0 && el.textContent.trim().length < 100) {
            res.push(el.textContent.trim());
          }
        }
        return [...new Set(res)];
      });
      allTexts = allTexts.concat(texts);
    } catch (e) {}
  }
  return [...new Set(allTexts)];
}

async function main() {
  console.log("Killing any previous Chrome instance on port 9228...");
  try {
    execSync('pkill -9 -f "chrome-profile" || true');
  } catch (err) {}

  console.log("Launching fresh Google Chrome on port 9228...");
  const spawn = require('child_process').spawn;
  const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--remote-allow-origins=*',
    '--no-sandbox',
    '--start-maximized',
    '--window-size=1440,900'
  ], {
    detached: true,
    stdio: 'ignore'
  });
  chromeProcess.unref();

  let wsUrl;
  let attempts = 0;
  while (attempts < 10) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      console.log("Connected to Chrome debugging port!");
      break;
    } catch (err) {
      attempts++;
      console.log(`Waiting for Chrome... Attempt ${attempts}/10`);
    }
  }

  if (!wsUrl) {
    throw new Error("Could not connect to Chrome debugging port 9228.");
  }

  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl,
    defaultViewport: null // Use full window size
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to Base44 app preview...");
  await page.goto('https://app.base44.com/apps/69cdf181f5c88ef4b84557f2/editor/preview', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log("Waiting 15 seconds for initial rendering...");
  await new Promise(r => setTimeout(r, 15000));

  // Check if we need to log in (check all frames)
  let emailInputFound = false;
  for (const frame of page.frames()) {
    try {
      const emailInput = await frame.$('input[type="email"], input[name="email"], input[placeholder*="Email"], #email');
      if (emailInput) {
        console.log(`🔑 Login form detected in frame: ${frame.url()}`);
        console.log("Typing email...");
        await emailInput.type('living.cheap.american@gmail.com');
        const passwordInput = await frame.$('input[type="password"]');
        if (passwordInput) {
          console.log("Typing password...");
          await passwordInput.type('American1234+@');
          const submitBtn = await frame.$('button[type="submit"], button');
          console.log("Clicking submit...");
          await submitBtn.click();
          console.log("Submitted login. Waiting for redirect...");
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 10000));
        }
        emailInputFound = true;
        break;
      }
    } catch (e) {
      console.error("Error during login check:", e);
    }
  }
  
  if (!emailInputFound) {
    console.log("No login form detected. Assuming already logged in.");
  }

  // Visual helper to highlight the test action starting
  await page.evaluate(() => {
    const status = document.createElement('div');
    status.id = 'ai-status-banner';
    status.style.position = 'fixed';
    status.style.top = '10px';
    status.style.right = '10px';
    status.style.backgroundColor = '#1e293b';
    status.style.color = '#38bdf8';
    status.style.padding = '8px 16px';
    status.style.borderRadius = '20px';
    status.style.fontFamily = 'sans-serif';
    status.style.fontSize = '14px';
    status.style.fontWeight = 'bold';
    status.style.zIndex = '99999999';
    status.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    status.style.border = '1px solid #38bdf8';
    status.textContent = '🤖 Autonómny QA Agent spustený...';
    document.body.appendChild(status);
  }).catch(() => {});

  const updateBanner = async (text) => {
    try {
      await page.evaluate((txt) => {
        const banner = document.getElementById('ai-status-banner');
        if (banner) {
          banner.textContent = `🤖 ${txt}`;
        } else {
          // Re-create if missing due to navigation
          const status = document.createElement('div');
          status.id = 'ai-status-banner';
          status.style.position = 'fixed';
          status.style.top = '10px';
          status.style.right = '10px';
          status.style.backgroundColor = '#1e293b';
          status.style.color = '#38bdf8';
          status.style.padding = '8px 16px';
          status.style.borderRadius = '20px';
          status.style.fontFamily = 'sans-serif';
          status.style.fontSize = '14px';
          status.style.fontWeight = 'bold';
          status.style.zIndex = '99999999';
          status.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
          status.style.border = '1px solid #38bdf8';
          status.textContent = `🤖 ${txt}`;
          document.body.appendChild(status);
        }
      }, text);
    } catch (e) {
      console.log(`Failed to update banner: ${e.message}`);
    }
  };

  // 1. Click War Room if we see it
  await updateBanner("Prechádzam na War Room...");
  let clicked = await findAndClickElement(page, 'War Room');
  if (clicked) {
    await new Promise(r => setTimeout(r, 6000));
  }

  // 2. Click Údržbár or QA Panel
  await updateBanner("Otváram panel Údržbár...");
  let clickedQa = await findAndClickElement(page, 'Údržbár');
  if (!clickedQa) {
    clickedQa = await findAndClickElement(page, 'QA Panel');
  }
  await new Promise(r => setTimeout(r, 4000));

  // 3. Click SPUSTIŤ KOMPLETNÝ TEST INTEGRITY
  await updateBanner("Spúšťam kompletný test integrity...");
  await findAndClickElement(page, 'SPUSTIŤ KOMPLETNÝ TEST INTEGRITY');

  console.log("Waiting 20 seconds for the integrity test...");
  for (let i = 20; i > 0; i -= 2) {
    await updateBanner(`Spustený test integrity (${i}s)...`);
    await new Promise(r => setTimeout(r, 2000));
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_test_results.png') });

  // 4. Click the first recording to load detail
  await updateBanner("Vyberám prvý záznam hovoru...");
  
  // Find first recording
  let foundRecording = null;
  for (const frame of page.frames()) {
    try {
      const handle = await frame.evaluateHandle(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        return divs.find(el => {
          if (el.id === 'ai-status-banner' || el.closest('#ai-status-banner') || 
              el.id === 'ai-mouse-cursor' || el.closest('#ai-mouse-cursor')) {
            return false;
          }
          const text = el.textContent || "";
          return el.className && el.className.includes('cursor-pointer') && 
                 (text.includes('hovor') || text.includes('American') || text.includes('Klient') || el.querySelector('h4'));
        });
      });
      const element = handle.asElement();
      if (element) {
        foundRecording = { frame, element };
        break;
      }
    } catch (e) {}
  }

  if (foundRecording) {
    const box = await foundRecording.element.boundingBox();
    if (box) {
      const cx = box.x + box.width / 4;
      const cy = box.y + box.height / 2;
      
      await page.evaluate((x, y) => {
        let cursor = document.getElementById('ai-mouse-cursor');
        if (cursor) {
          cursor.style.left = `${x - 12}px`;
          cursor.style.top = `${y - 12}px`;
        }
      }, cx, cy).catch(() => {});
      
      await new Promise(r => setTimeout(r, 900));
      
      await page.evaluate(() => {
        let cursor = document.getElementById('ai-mouse-cursor');
        if (cursor) {
          cursor.style.transform = 'scale(0.7)';
          setTimeout(() => { cursor.style.transform = 'scale(1)'; }, 150);
        }
      }).catch(() => {});
      
      await foundRecording.element.click();
      console.log("✅ Clicked first recording.");
    }
  }

  await updateBanner("Načítavam detaily hovoru...");
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_recording_detail.png') });

  // 5. Verify objections and stress timeline
  await updateBanner("Analyzujem námietky a časovú os stresu...");
  const detailTexts = await dumpAllTextsInFrames(page);
  const hasObjections = detailTexts.some(t => t.toLowerCase().includes('námiet') || t.toLowerCase().includes('objection'));
  const hasStress = detailTexts.some(t => t.toLowerCase().includes('stres') || t.toLowerCase().includes('stress') || t.toLowerCase().includes('časová os'));
  
  console.log(`Validation Results:`);
  console.log(`- Objections Displayed: ${hasObjections}`);
  console.log(`- Stress Timeline Displayed: ${hasStress}`);

  await updateBanner(`Overené: Námietky=${hasObjections ? 'Áno' : 'Nie'}, Stres=${hasStress ? 'Áno' : 'Nie'}`);
  await new Promise(r => setTimeout(r, 4000));

  await page.evaluate(() => {
    const banner = document.getElementById('ai-status-banner');
    const cursor = document.getElementById('ai-mouse-cursor');
    if (banner) banner.remove();
    if (cursor) cursor.remove();
  }).catch(() => {});

  await browser.disconnect();
  console.log("Done!");
}

main().catch(console.error);
