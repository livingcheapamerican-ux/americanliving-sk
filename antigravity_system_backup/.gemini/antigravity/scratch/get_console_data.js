const tabId = 'E13712B651989F80AC6575C15B3DFDFF';

async function extract() {
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
    // We will evaluate document.body.innerText to see the page content
    const msg = JSON.stringify({
      id: 2,
      method: 'Runtime.evaluate',
      params: {
        expression: 'document.body.innerText',
        returnByValue: true
      }
    });
    ws.send(msg);
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === 2) {
      if (data.result && data.result.result && data.result.result.value) {
        console.log('--- PAGE CONTENT START ---');
        console.log(data.result.result.value);
        console.log('--- PAGE CONTENT END ---');
      } else {
        console.log('Could not get page content:', JSON.stringify(data));
      }
      ws.close();
    }
  };
  
  ws.onerror = (err) => {
    console.error('WS Error:', err);
  };
}

extract();
