# Direct-to-Provider API Rule (Cost Effective Architecture)

## Context
When performing AI operations (like LLM inferences, multimodal transcriptions, embeddings, or image generations), many backend platforms (Base44, Supabase wrappers, Zapier, etc.) provide built-in integrations (e.g., `InvokeLLM`). These built-in integrations typically charge a significant markup, obfuscate errors, limit model choices, and introduce unwanted vendor lock-in.

## The Rule
All AI agents and developers must bypass platform-specific AI wrappers and **connect directly to the provider's API** (Google, OpenAI, Anthropic, etc.) using native `fetch` mechanisms and raw API keys stored in environment variables.

### Key Requirements:
1. **Raw Fetch:** Use `fetch('https://generativelanguage.googleapis.com/...', { ... })` instead of SDK abstractions like `InvokeLLM`.
2. **Inline Data:** When passing files (audio, images, PDFs) to the model, convert them to `base64` and send them as `inlineData` within the API payload. Avoid uploading them to expensive intermediary cloud storage merely to obtain a URL for the model, unless the app inherently requires the file to be stored.
3. **Fail-Safes:** Wrap raw API calls in explicit `try-catch` blocks and expose the precise provider error messages (e.g. `await res.text()`) rather than generic 500 errors.

### Example (Gemini API direct fetch):
```javascript
const apiKey = Deno.env.get("GEMINI_API_KEY");
const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${apiKey}\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ contents: [...] })
});
```

By strictly adhering to this rule, the application remains **cost-effective (fraction of a cent vs dollars per run)**, **portable**, and **fast**.
