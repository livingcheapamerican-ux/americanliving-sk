// Test script to run via npx base44 exec

async function runTest(agentName, question) {
  console.log(`\n=========================================`);
  console.log(`Running test conversation for agent: ${agentName}`);
  console.log(`=========================================`);
  try {
    console.log("Creating conversation...");
    const conversation = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `Verification Test ${agentName}` }
    });
    console.log("Conversation created successfully! ID:", conversation.id);
    
    console.log(`Asking: "${question}"`);
    await base44.agents.addMessage(conversation, { role: "user", content: question });
    console.log("User message added! Waiting for assistant response...");
    
    // Poll for response since they are streaming/running in background
    let assistantReply = null;
    for (let attempt = 1; attempt <= 8; attempt++) {
      await new Promise(r => setTimeout(r, 4000));
      console.log(`Checking for reply (attempt ${attempt}/8)...`);
      const details = await base44.agents.getConversation(conversation.id);
      const lastMessage = details.messages?.filter(m => m.role === 'assistant').pop();
      if (lastMessage && lastMessage.content && lastMessage.content.trim().length > 0) {
        assistantReply = lastMessage.content;
        break;
      }
    }
    
    if (assistantReply) {
      console.log("\nResponse received:");
      console.log(assistantReply);
    } else {
      console.log("\nNo response received within timeout.");
    }
  } catch (e) {
    console.error(`Error with agent ${agentName}:`, e.message || e);
  }
}

async function main() {
  await runTest(
    "american_living_assistant", 
    "Ahoj, chcel by som sa opýtať: je stavebné povolenie zadarmo?"
  );
  await runTest(
    "quote_assistant", 
    "Je stavebné povolenie a projektová dokumentácia zadarmo?"
  );
}

await main();
