const tabId = 'E13712B651989F80AC6575C15B3DFDFF';
const savePath = '/Users/richardkovac/.gemini/antigravity/brain/0686a8e4-18ac-4ef3-8cfe-ccd177009fa1/gsc_screenshot.png';

async function screenshot() {
  const res = await fetch('http://localhost:9222/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) {
    console.error('Tab not found!');
    return;
  }
  
  console.log(`Connecting to ${tab.url}...`);
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  
  ws.onopen = () => {
    console.log('Taking screenshot...');
    const msg = JSON.stringify({
      id: 3,
      method: 'Page.captureScreenshot',
      params: {
        format: 'png'
      }
    });
    ws.send(msg);
  };
  
  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.id === 3) {
      if (data.result && data.result.data) {
        const buffer = Uint8Array.from(atob(data.result.data), c => c.charCodeAt(0));
        await Deno.writeFile(savePath, buffer);
        console.log('✅ Screenshot saved to:', savePath);
      } else {
        console.error('Failed to take screenshot:', JSON.stringify(data));
      }
      ws.close();
    }
  };
  
  ws.onerror = (err) => {
    console.error('WS Error:', err);
  };
}

screenshot();
