const tabId = 'E13712B651989F80AC6575C15B3DFDFF';
const testUrl = 'https://www.americanliving.sk/katalog';

async function testRoute() {
  const res = await fetch('http://localhost:9222/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) {
    console.error('Tab not found!');
    return;
  }
  
  console.log(`Navigating to ${testUrl}...`);
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Page.navigate',
      params: { url: testUrl }
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Response:', data);
    ws.close();
  };
}

testRoute();
