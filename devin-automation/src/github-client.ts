import fetch from 'node-fetch';

const GITHUB_API = 'https://api.github.com';

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  html_url: string;
  pull_request?: object;
}

export async function getOpenIssues(): Promise<GitHubIssue[]> {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  const res = await fetch(`${GITHUB_API}/repos/${repo}/issues?state=open&per_page=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const issues = (await res.json()) as GitHubIssue[];
  return issues.filter(i => !i.pull_request);
}

