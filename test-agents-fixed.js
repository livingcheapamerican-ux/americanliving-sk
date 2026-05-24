// Mock window and document for base44 SDK in Node environment
global.window = {
  location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' },
  history: { replaceState: () => {} },
  localStorage: {
    getItem: (k) => null,
    setItem: (k, v) => {}
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.document = {
  title: 'Test Title',
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = global.window.localStorage;
global.URLSearchParams = class URLSearchParams {
  constructor() {}
  get() { return null; }
  delete() {}
  toString() { return ''; }
};

async function run() {
  console.log("Dynamically importing base44Client...");
  const { base44 } = await import('./src/api/base44Client.js');
  console.log("Client created successfully!");
  
  try {
    console.log("Creating agent conversation for 'american_living_assistant'...");
    const conversation = await base44.agents.createConversation({
      agent_name: "american_living_assistant",
      metadata: { name: "Test Chatbot Node" }
    });
    console.log("Conversation created:", conversation.id);
    
    console.log("Adding test message...");
    await base44.agents.addMessage(conversation, { role: "user", content: "Ahoj, ake domy mate v ponuke?" });
    console.log("Message added!");
    
    console.log("Waiting 5 seconds for reply...");
    await new Promise(r => setTimeout(r, 5000));
    
    console.log("Fetching conversation details...");
    const details = await base44.agents.getConversation(conversation.id);
    console.log("Conversation messages count:", details.messages?.length);
    console.log("Messages:");
    details.messages?.forEach(m => {
      console.log(`- [${m.role}]: ${m.content}`);
    });
  } catch (e) {
    console.error("Error running test:", e);
  }
}

run();
