import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  token: token,
  requiresAuth: false
});

async function run() {
  try {
    console.log("Fetching user sessions from base44 database...");
    // Fetch last 1000 sessions
    const sessions = await base44.entities.UserSession.list('-created_date', 1000);
    console.log(`Fetched ${sessions.length} sessions.`);

    const allErrors = [];

    for (const session of sessions) {
      const errors = session.errors_encountered || [];
      if (errors.length > 0) {
        for (const err of errors) {
          allErrors.push({
            sessionId: session.id,
            userEmail: session.user_email || 'anonymous',
            device: session.device_info || {},
            location: session.location_info || {},
            startTime: session.start_time,
            errorMessage: err.error_message || err.message || 'Unknown error',
            errorStack: err.error_stack || err.stack || '',
            timestamp: err.timestamp || session.created_date,
            pageUrl: err.page_url || 'Unknown'
          });
        }
      }
    }

    console.log(`\nFound total ${allErrors.length} javascript errors/exceptions in these sessions.`);

    if (allErrors.length === 0) {
      console.log("No JavaScript errors recorded!");
      return;
    }

    // Group by unique error message + pageUrl
    const errorGroups = {};
    for (const err of allErrors) {
      const key = `${err.errorMessage} @ ${err.pageUrl}`;
      if (!errorGroups[key]) {
        errorGroups[key] = {
          message: err.errorMessage,
          pageUrl: err.pageUrl,
          stack: err.errorStack,
          count: 0,
          occurrences: []
        };
      }
      errorGroups[key].count++;
      errorGroups[key].occurrences.push(err);
    }

    // Sort by count descending
    const sortedGroups = Object.values(errorGroups).sort((a, b) => b.count - a.count);

    console.log("\n================ UNIQUE JAVASCRIPT ERRORS ================\n");
    for (const group of sortedGroups) {
      console.log(`Error: "${group.message}"`);
      console.log(`Page: ${group.pageUrl}`);
      console.log(`Count: ${group.count}`);
      console.log("First occurrence:", group.occurrences[0].timestamp);
      console.log("Last occurrence:", group.occurrences[group.occurrences.length - 1].timestamp);
      if (group.stack) {
        console.log("Stack Trace (snippet):");
        console.log(group.stack.split('\n').slice(0, 5).join('\n'));
      }
      console.log("----------------------------------------------------------\n");
    }

    // Write full report as JSON to scratch
    fs.writeFileSync('scratch/errors-report.json', JSON.stringify(sortedGroups, null, 2));
    console.log("Full report written to scratch/errors-report.json");

  } catch (e) {
    console.error("Error:", e);
  }
}

run();
