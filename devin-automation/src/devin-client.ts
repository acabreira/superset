import fetch from 'node-fetch';
import { GitHubIssue } from './github-client';

const DEVIN_API = 'https://api.devin.ai';

interface DevinSessionResponse {
  session_id: string;
  status: string;
  pull_requests?: Array<{ pr_url: string; pr_state: string | null }>;
}

export async function createSession(issue: GitHubIssue): Promise<string> {
  const orgId = process.env.DEVIN_ORG_ID;
  const apiKey = process.env.DEVIN_API_KEY;
  const repo = process.env.GITHUB_REPO;

  const prompt = `You are working on the Apache Superset repository at https://github.com/${repo}.

A new GitHub issue has been filed:

Issue #${issue.number}: ${issue.title}

${issue.body || 'No description provided.'}

Please investigate this issue, implement a fix, and open a pull request. Include "Closes #${issue.number}" in the PR description so the issue is automatically closed when the PR is merged.`;

  const res = await fetch(`${DEVIN_API}/v3/organizations/${orgId}/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      tags: [`issue-${issue.number}`],
    }),
  });

  if (!res.ok) {
    throw new Error(`Devin API error: ${res.status} ${res.statusText}`);
  }

  const session = (await res.json()) as DevinSessionResponse;
  return session.session_id;
}

export async function getSessionStatus(sessionId: string): Promise<{ status: string; pr_url?: string }> {
  const orgId = process.env.DEVIN_ORG_ID;
  const apiKey = process.env.DEVIN_API_KEY;

  const res = await fetch(`${DEVIN_API}/v3/organizations/${orgId}/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`Devin API error: ${res.status} ${res.statusText}`);
  }

  const session = (await res.json()) as DevinSessionResponse;
  const pr_url = session.pull_requests?.[0]?.pr_url;
  return { status: session.status, pr_url };
}

export async function terminateSession(sessionId: string): Promise<void> {
  const apiKey = process.env.DEVIN_PERSONAL_KEY;

  const res = await fetch(`${DEVIN_API}/v1/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const body = await res.json().catch(() => null);
  console.log(`Terminate session ${sessionId} — status: ${res.status}`, body);
}
