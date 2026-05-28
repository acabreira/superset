# Devin Superset Automation

Automated issue remediation for Apache Superset. When a new GitHub issue is created in the repository, the system dispatches Devin to investigate and fix it, then opens a pull request. No manual intervention required.

---

## How It Works

```
GitHub issue created
        ↓
Poller detects new issue (every 60s)
        ↓
Devin session created via API
        ↓
Devin reads the issue, navigates the codebase, implements a fix
        ↓
Devin opens a pull request
        ↓
Dashboard updates — PR link appears
```

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- A [Devin](https://app.devin.ai) account with a service user API key (`cog_` prefix)
- A GitHub personal access token with `repo` scope
- A forked copy of `apache/superset` with Issues enabled

---

## Setup

**1. Clone the repo and navigate to this directory**

```bash
cd devin-automation
```

**2. Create your `.env` file**

```bash
cp .env.example .env
```

Fill in the values:

```env
DEVIN_API_KEY=cog_your_service_key_here
DEVIN_PERSONAL_KEY=apk_user_your_personal_key_here
DEVIN_ORG_ID=org-your_org_id_here
GITHUB_TOKEN=your_github_pat_here
GITHUB_REPO=your-username/superset
POLL_INTERVAL_MS=60000
PORT=3000
```

> **Two Devin API keys are required:**
> - `DEVIN_API_KEY` — service user key (`cog_` prefix). Used to create and poll sessions via the v3 API.
> - `DEVIN_PERSONAL_KEY` — personal key (`apk_user_` prefix). Used to terminate sessions via the v1 API. Required for the Delete Session button on the dashboard.

**3. Start the system**

```bash
docker compose up --build
```

You should see:
```
Database initialized at /app/data/db.json
Polling GitHub for new issues...
Dashboard running at http://localhost:3000/dashboard
```

---

## Simulating the Workflow

**1. Create a GitHub issue** in your forked repository with a clear, specific description. Example:

> **Title:** Replace `Optional[X]` with `X | None` in `superset/exceptions.py`
>
> **Body:** `superset/exceptions.py` imports `Optional` from `typing` (line 21) but already has `from __future__ import annotations` on line 18. Replace all `Optional[X]` occurrences with `X | None` and remove the `Optional` import.

**2. Wait up to 60 seconds** — the poller checks GitHub every 60 seconds. Watch the Docker logs:
```
New issue: #2 — Replace Optional[X] with X | None...
Devin session created: abc123...
Tracking session abc123...
```

**3. Monitor Devin** at [app.devin.ai](https://app.devin.ai) — click into the active session to watch it work in real time.

**4. View the dashboard** at [http://localhost:3000/dashboard](http://localhost:3000/dashboard) — refreshes every 15 seconds. When Devin opens a PR, the status updates and a link appears.

---

## Dashboard

| Column | Description |
|--------|-------------|
| Issue | Link to the GitHub issue |
| Status | PR Opened / In Progress |
| PR | Link to Devin's pull request |
| Session | Link to the Devin session on app.devin.ai |
| Started | When the session was dispatched |
| Actions | Delete Session button to terminate a stuck session |

---

## Project Structure

```
devin-automation/
├── src/
│   ├── index.ts          # Entry point — starts Express + poller
│   ├── db.ts             # JSON file storage (issues + sessions)
│   ├── github-client.ts  # GitHub API — fetch open issues
│   ├── devin-client.ts   # Devin API — create/poll/terminate sessions
│   ├── tracker.ts        # Polls session every 30s until PR is opened
│   ├── poller.ts         # Polls GitHub every 60s for new issues
│   └── dashboard.ts      # Express routes for dashboard data
├── public/
│   └── dashboard.html    # Observability dashboard UI
├── data/                 # db.json lives here at runtime (gitignored)
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Resetting State

To reprocess issues (e.g. during testing):

```bash
rm data/db.json
docker compose restart
```

---

## Tech Stack

- **TypeScript** (Node.js 20)
- **Express** — dashboard server
- **JSON file** — lightweight storage, no external DB
- **Docker + Docker Compose** — single container deployment
- **GitHub REST API** — issue polling
- **Devin API v1/v3** — session management
