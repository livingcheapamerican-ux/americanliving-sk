import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  requiresAuth: false
});

async function run() {
  try {
    console.log("Creating unauthenticated conversation for american_living_assistant...");
    const conversation = await base44.agents.createConversation({
      agent_name: "american_living_assistant",
      metadata: { name: "Test Unauthenticated Run" }
    });
    console.log("Conversation created successfully! ID:", conversation.id);
    
    console.log("Adding user message...");
    await base44.agents.addMessage(conversation.id, { role: "user", content: "Ahoj, ake Ticab domy mate?" });
    console.log("User message added! Waiting 8 seconds for assistant response...");
    
    await new Promise(r => setTimeout(r, 8000));
    
    console.log("Retrieving conversation...");
    const details = await base44.agents.getConversation(conversation.id);
    console.log("Messages:");
    details.messages?.forEach(m => {
      console.log(`- [${m.role}]: ${m.content}`);
    });
  } catch (e) {
    console.error("Error running test:", e);
  }
}
run();
