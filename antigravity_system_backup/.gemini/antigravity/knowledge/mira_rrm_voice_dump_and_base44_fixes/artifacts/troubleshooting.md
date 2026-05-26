# MIRA RRM: Voice Dump & Base44 Troubleshooting

## 1. Base44 Vite Plugin `SecurityError` Crash
**Issue:** `TypeError: Cannot read properties of undefined (reading 'match')` in `@base44/vite-plugin/dist/injections/unhandled-errors-handlers.js`.
**Cause:** ServiceWorker registrations often throw `SecurityError` (e.g. MIME type issues or restricted iframe permissions). These error objects do not have a `.stack` property. The Base44 Vite plugin has a global error handler that expects a `.stack` string and crashes when calling `.match()`.
**Fix:** In `src/main.jsx` and `src/AppView.jsx`, intercept `unhandledrejection`. If the error is a `SecurityError`, call `e.stopImmediatePropagation()` and `e.preventDefault()` to prevent the Vite plugin's listener from executing and crashing the entire React app.

## 2. Base44 PWA Precache Build Failure (2MB Limit)
**Issue:** `maximumFileSizeToCacheInBytes` exceeded during `npm run build`.
**Cause:** The application bundle size grew too large due to heavy page imports, exceeding the Workbox PWA precache 2MB limit.
**Fix:** Convert eager imports in `src/AppView.jsx` to dynamic imports using `React.lazy()` and wrap the router in `<Suspense>`. This triggers Webpack/Vite code-splitting, keeping individual chunks safely under the 2MB threshold.

## 3. Database Metadata Corruption (Stringified JSON)
**Issue:** Voice Dump participant array resets to `[]` or `undefined` after status updates.
**Cause:** Base44 edge functions sometimes read/write JSON `metadata` columns as raw strings instead of parsed objects. When the backend does a partial update (e.g. `upload_participant_audio`), it may inadvertently overwrite the entire `metadata` with a string or drop nested objects.
**Fix:** Always implement defensive parsing in edge functions (e.g. `entry.ts`):
```javascript
let currentMetadata = typeof meeting.metadata === "string" ? JSON.parse(meeting.metadata) : meeting.metadata;
```
Ensure that all nested arrays (like `participants`) are preserved during database updates.

## 4. Voice Dump Infinite Spin ("Čakám na dáta z mobilov...")
**Issue:** The UI stays stuck in the "processing" state indefinitely after ending a meeting.
**Cause:** The system expected `chunksCount >= expectedCount`. If the host's microphone failed to initialize (e.g. due to denied permissions in an iframe), the host chunk was never recorded or uploaded. However, `expectedCount` still accounted for the host, making the condition impossible to fulfill.
**Fix:** In `MeetingSetup.jsx`, dynamically adjust the expected count based on active hardware states:
```javascript
const expectedCount = mediaRecorderRef.current ? participantsCount : Math.max(0, participantsCount - 1);
```
Additionally, ensure the participant array wasn't wiped (see issue #3), as a missing `hostId` would also cause the upload function to silently abort.
