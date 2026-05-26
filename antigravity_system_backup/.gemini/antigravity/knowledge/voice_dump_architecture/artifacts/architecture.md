# Voice Dump Client-Side Architecture

## Background
Originally, MIRA RRM sent large audio files to a Base44 Edge Function, which then called Google Gemini. This caused `HTTP 500` gateway timeouts because Edge Functions have a strict execution time limit (usually 10-15s), and long voice analysis can take up to 45 seconds.

## The Solution (Client-Side Direct-to-Provider)
To bypass server limits, the heavy processing was moved to the browser (Client-Side).
The architecture now follows a strict two-step process:

1. **`get_config` (Server)**: The browser calls the Edge Function to securely retrieve the `GEMINI_API_KEY` and context prompts. 
   - *Requirement*: The `GEMINI_API_KEY` MUST be stored in the Base44 Secrets manager. If the secret is added, the Edge Function must be redeployed to mount it.
2. **Direct Gemini Call (Browser)**: The browser sends the audio directly to `generativelanguage.googleapis.com`. Browsers have no strict timeout limits for long HTTP requests.
3. **`save_result` (Server)**: The browser sends the finalized AI JSON payload back to the Edge Function to store the tasks and structured data in the database.

## Critical Sandbox Proxy Fix (The `fetch` vs `invoke` Trap)
When testing in the Base44 Preview Sandbox (`https://preview--mira-rrm-ostr-model.base44.app`), using relative `fetch` paths (`/api/apps/...`) results in a `404 Not Found` because the sandbox domain does not host the API gateway.

While the standard solution is to use the Base44 SDK (`base44.functions.invoke()`), the SDK wrapper uses `axios` and expects a JSON `body`. Passing a raw `FormData` object to `invoke()` causes malformed requests and `400 Bad Request` errors.

**Rule:** When interacting with Edge Functions that require `FormData` (e.g., file uploads) within the MIRA Base44 environment, you MUST use a raw `fetch` call with an absolute URL pointing to the production API gateway, injecting the user token manually:

```javascript
const edgeUrl = `https://app.base44.com/api/apps/${appParams.appId}/functions/processVoiceDump/invoke`;
const configRes = await fetch(edgeUrl, {
  method: "POST",
  headers: { Authorization: `Bearer ${appParams.token}` },
  body: configFormData // FormData object
});
```

## Critical Model Selection (Gemini)
Through exhaustive production testing, it is **strictly required** to use the `gemini-2.5-flash` model for Voice Dump operations. 
- `gemini-1.5-flash` does NOT work and fails to provide reliable outputs for our architecture.
- `gemini-2.0-flash` is deprecated and returns a `404 Not Found` error.
Always explicitly construct the API endpoint as: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`
