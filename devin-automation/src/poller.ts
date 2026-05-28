import { getOpenIssues } from './github-client';
import { createSession } from './devin-client';
import { isIssueProcessed, markIssueProcessed, saveSession } from './db';
import { trackSession } from './tracker';

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '60000', 10);

async function poll(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Polling GitHub for new issues...`);

  try {
    const issues = await getOpenIssues();

    for (const issue of issues) {
      if (isIssueProcessed(issue.number)) continue;

      console.log(`New issue: #${issue.number} — ${issue.title}`);

      const sessionId = await createSession(issue);
      markIssueProcessed(issue.number, issue.title, issue.html_url);
      saveSession(issue.number, sessionId);

      console.log(`Devin session created: ${sessionId}`);
      trackSession(sessionId);
    }
  } catch (err) {
    console.error('Poll error:', err);
  }
}

export function startPoller(): void {
  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}
