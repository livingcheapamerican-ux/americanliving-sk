const targetUrl = 'https://search.google.com/search-console/index?resource_id=https://americanliving.sk/&utm_source=wnc_20237597&utm_medium=gamma&utm_campaign=wnc_20237597&utm_content=msg_110624660&hl=sk';

async function navigate() {
  const res = await fetch('http://localhost:9222/json');
  const tabs = await res.json();
  console.log('Found tabs:', tabs.map(t => ({ id: t.id, title: t.title, url: t.url })));
  
  // Find a page tab
  const pageTab = tabs.find(t => t.type === 'page');
  if (!pageTab) {
    console.error('No page tab found!');
    return;
  }
  
  console.log(`Connecting to tab ${pageTab.id} (${pageTab.title || 'Untitled'})...`);
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  
  ws.onopen = () => {
    console.log('Connected! Sending navigation command...');
    const msg = JSON.stringify({
      id: 1,
      method: 'Page.navigate',
      params: { url: targetUrl }
    });
    ws.send(msg);
  };
  
  ws.onmessage = (event) => {
    console.log('Received response:', event.data);
    ws.close();
  };
  
  ws.onerror = (err) => {
    console.error('WS Error:', err);
  };
  
  ws.onclose = () => {
    console.log('WS Connection closed');
  };
}

navigate();
