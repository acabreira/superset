import { Router } from 'express';
import path from 'path';
import { getAllSessions, updateSession } from './db';
import { terminateSession } from './devin-client';

export const dashboardRouter = Router();

dashboardRouter.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

dashboardRouter.get('/data', (_req, res) => {
  const sessions = getAllSessions() as Array<{
    session_id: string;
    issue_number: number;
    issue_title: string;
    issue_url: string;
    status: string;
    pr_url?: string;
    created_at: string;
  }>;

  res.json({
    summary: {
      totalIssues: sessions.length,
      prsOpened: sessions.filter(s => s.status === 'success').length,
    },
    sessions,
  });
});

dashboardRouter.delete('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    await terminateSession(sessionId);
    updateSession(sessionId, 'terminated');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});
