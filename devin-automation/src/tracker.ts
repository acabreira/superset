import { getSessionStatus } from './devin-client';
import { updateSession } from './db';

const TRACKER_POLL_MS = 30000;

export function trackSession(sessionId: string): void {
  console.log(`Tracking session ${sessionId}`);

  const interval = setInterval(async () => {
    try {
      const { status, pr_url } = await getSessionStatus(sessionId);
      console.log(`Session ${sessionId} — status: ${status} | pr: ${pr_url || 'none'}`);

      if (pr_url) {
        updateSession(sessionId, 'success', pr_url);
        console.log(`Session ${sessionId} → PR opened: ${pr_url}`);
        clearInterval(interval);
      }
    } catch (err) {
      console.error(`Tracker error for session ${sessionId}:`, err);
      clearInterval(interval);
    }
  }, TRACKER_POLL_MS);
}
