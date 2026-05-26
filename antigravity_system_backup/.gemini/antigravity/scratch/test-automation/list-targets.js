const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/richardkovac/.gemini/antigravity/brain/e2e4fed3-65f5-49f1-a551-bd4ba1a405b2';

async function clickTextInFrames(page, text) {
  console.log(`Searching for text "${text}" in all ${page.frames().length} frames...`);
  for (const frame of page.frames()) {
    try {
      const clicked = await frame.evaluate((txt) => {
        const elements = document.querySelectorAll('button, a, div, span, p, li, h1, h2, h3, h4, h5, td');
        
        // 1. Try exact match (case insensitive)
        for (const el of elements) {
          if (el.textContent && el.textContent.trim().toLowerCase() === txt.toLowerCase()) {
            el.click();
            el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            return el.textContent.trim();
          }
        }
        
        // 2. Try partial match
        for (const el of elements) {
          if (el.textContent && el.textContent.trim().toLowerCase().includes(txt.toLowerCase())) {
            el.click();
            el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            return el.textContent.trim();
          }
        }
        return null;
      }, text);
      
      if (clicked) {
        console.log(`✅ Clicked element with text "${text}" in frame "${frame.url()}": "${clicked}"`);
        return true;
      }
    } catch (e) {
      // Ignore evaluation errors on specific frames (e.g. blank pages)
    }
  }
  console.log(`❌ Text "${text}" not found in any frame.`);
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
  allTexts = [...new Set(allTexts)];
  console.log(`Visible texts across all frames (count: ${allTexts.length}, showing first 60):`);
  console.log(allTexts.slice(0, 60));
  return allTexts;
}

async function clickFirstRecordingInFrames(page) {
  for (const frame of page.frames()) {
    try {
      const clicked = await frame.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        const recordingItem = divs.find(el => {
          const text = el.textContent || "";
          return el.className && el.className.includes('cursor-pointer') && 
                 (text.includes('hovor') || text.includes('American') || text.includes('Klient') || el.querySelector('h4'));
        });
        if (recordingItem) {
          recordingItem.click();
          recordingItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return recordingItem.textContent.trim().substring(0, 80);
        }
        return null;
      });
      if (clicked) {
        console.log(`✅ Clicked recording row in frame "${frame.url()}": "${clicked}"`);
        return clicked;
      }
    } catch (e) {}
  }
  console.log("❌ Recording row not found in any frame.");
  return null;
}

async function main() {
  console.log("Connecting to Chrome on port 9228...");
  const res = await fetch('http://127.0.0.1:9228/json/version');
  const data = await res.json();
  const wsUrl = data.webSocketDebuggerUrl;
  console.log("WebSocket URL:", wsUrl);

  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl,
    defaultViewport: { width: 1440, height: 900 }
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());
  
  console.log("Navigating to Base44 app preview...");
  await page.goto('https://app.base44.com/apps/69cdf181f5c88ef4b84557f2/editor/preview', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log("Waiting 15 seconds for initial rendering...");
  await new Promise(r => setTimeout(r, 15000));

  // Check for login (check all frames)
  let emailInputFound = false;
  for (const frame of page.frames()) {
    try {
      const emailInput = await frame.$('input[type="email"], input[name="email"], input[placeholder*="Email"], #email');
      if (emailInput) {
        console.log(`Login form detected in frame: ${frame.url()}`);
        await emailInput.type('living.cheap.american@gmail.com');
        const passwordInput = await frame.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.type('American1234+@');
          const submitBtn = await frame.$('button[type="submit"], button');
          await submitBtn.click();
          console.log("Submitted login. Waiting for redirect...");
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 10000));
        }
        emailInputFound = true;
        break;
      }
    } catch (e) {}
  }
  
  if (!emailInputFound) {
    console.log("No login form detected. Assuming already logged in.");
  }

  // Save app loaded screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_app_loaded.png') });
  await dumpAllTextsInFrames(page);

  // 1. Click War Room
  console.log("Clicking 'War Room'...");
  await clickTextInFrames(page, 'War Room');
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_war_room_loaded.png') });
  await dumpAllTextsInFrames(page);

  // 2. Click Údržbár (QA Panel)
  console.log("Clicking 'Údržbár (QA Panel)'...");
  let clickedQa = await clickTextInFrames(page, 'Údržbár');
  if (!clickedQa) {
    clickedQa = await clickTextInFrames(page, 'QA Panel');
  }
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_qa_panel_open.png') });
  await dumpAllTextsInFrames(page);

  // 3. Click complete integrity test
  console.log("Clicking 'SPUSTIŤ KOMPLETNÝ TEST INTEGRITY'...");
  await clickTextInFrames(page, 'SPUSTIŤ KOMPLETNÝ TEST INTEGRITY');

  console.log("Waiting 20 seconds for integrity test to complete...");
  await new Promise(r => setTimeout(r, 20000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_test_results.png') });

  // 4. Click the first recording in the databázový monitor
  console.log("Clicking the first recording row in database monitor...");
  await clickFirstRecordingInFrames(page);

  console.log("Waiting 5 seconds for recording detail to load...");
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_recording_detail.png') });

  // 5. Verify objections and stress timeline
  console.log("Verifying objections and stress timeline...");
  const detailTexts = await dumpAllTextsInFrames(page);
  const hasObjections = detailTexts.some(t => t.toLowerCase().includes('námiet') || t.toLowerCase().includes('objection'));
  const hasStress = detailTexts.some(t => t.toLowerCase().includes('stres') || t.toLowerCase().includes('stress') || t.toLowerCase().includes('časová os'));
  
  console.log(`Validation Results:`);
  console.log(`- Objections Displayed: ${hasObjections}`);
  console.log(`- Stress Timeline Displayed: ${hasStress}`);

  await browser.disconnect();
  console.log("Done!");
}

main().catch(console.error);
