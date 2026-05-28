import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../data/db.json');

interface Issue {
  number: number;
  title: string;
  url: string;
  processed_at: string;
}

interface Session {
  issue_number: number;
  issue_title: string;
  issue_url: string;
  session_id: string;
  status: string;
  pr_url?: string;
  created_at: string;
}

interface DB {
  issues: Issue[];
  sessions: Session[];
}

function load(): DB {
  if (!fs.existsSync(DB_PATH)) return { issues: [], sessions: [] };
  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8').trim();
    if (!content) return { issues: [], sessions: [] };
    return JSON.parse(content);
  } catch {
    return { issues: [], sessions: [] };
  }
}

function save(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function initDb(): void {
  if (!fs.existsSync(DB_PATH)) {
    save({ issues: [], sessions: [] });
  }
  console.log('Database initialized at', DB_PATH);
}

export function isIssueProcessed(issueNumber: number): boolean {
  return load().issues.some(i => i.number === issueNumber);
}

export function markIssueProcessed(number: number, title: string, url: string): void {
  const db = load();
  if (!db.issues.some(i => i.number === number)) {
    db.issues.push({ number, title, url, processed_at: new Date().toISOString() });
    save(db);
  }
}

export function saveSession(issueNumber: number, sessionId: string): void {
  const db = load();
  const issue = db.issues.find(i => i.number === issueNumber);
  db.sessions.push({
    issue_number: issueNumber,
    issue_title: issue?.title || '',
    issue_url: issue?.url || '',
    session_id: sessionId,
    status: 'running',
    created_at: new Date().toISOString(),
  });
  save(db);
}

export function updateSession(sessionId: string, status: string, prUrl?: string): void {
  const db = load();
  const session = db.sessions.find(s => s.session_id === sessionId);
  if (session) {
    session.status = status;
    if (prUrl) session.pr_url = prUrl;
    save(db);
  }
}

export function getAllSessions(): Session[] {
  return load().sessions.slice().reverse();
}
