# Stop Tabac – PWA & API

A minimalist, mobile‑first Progressive Web App to help users quit smoking. It tracks smoke‑free days, serves short motivational sentences, and provides simple auth. Built with Node.js, Express, Pug, and a dark, thumb‑friendly UI.

## Features
- Mobile‑first PWA (installable, offline shell)
- Session‑based auth (login/register)
- Smoke‑free days counter (inclusive counting)
- Motivational sentence (async from IA endpoint)
- Dark theme, bottom navigation
- Dockerized + GitHub Actions release on tags

## Tech Stack
- Server: Node.js, Express, Pug
- Auth/session: express‑session
- DB: MySQL (mysql2)
- PWA: Manifest + Service Worker
- Logs: Winston
- Docker: buildx multi‑stage ready

## Quick Start
```bash
# 1) Install deps
npm install

# 2) Configure env
cp .env.example .env
# Edit MYSQL_* values to match your DB

# 3) Run (dev)
npm start
# http://localhost:3000
```

### Environment (.env)

PORT=3000
SESSION_SECRET=your-session-secret
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=tobacomit Date
  - PUT /api/user/change-date { date } (session)
- IA
  - GET /api/ia/get-model-sentence (session)

Example:
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"zach","password":"secret"}'
```

## Database & Migrations
- MySQL 8 DB: tobacomit
- SQL migrations: tobacomit_api/config/sql/
- Runner: migration/run_migrations.sh (executes .sql in numeric order against docker/db)

## Docker
```bash
# Build
docker build -t stop-tabac:local .

# Run
docker run -p 3000:3000 --env-file .env stop-tabac:local
```

### Docker Compose (MySQL)
```bash
cd docker
docker compose up -d
```

## PWA
- Manifest: public/manifest.json
- Service Worker: public/sw.js (network‑first for HTML, cache‑first for assets)
- Registration: public/javascripts/pwa.js

Tip: After deploys, hard‑refresh or update/skip‑waiting the SW to pick up new UI.

## CI/CD – Docker Release on Tags
- .github/workflows/release-docker.yml
- Push tags like v1, v1.2 or v1.2.3
- Builds/pushes to ghcr.io/<owner>/<repo>:<tag> and :latest
- Creates a GitHub Release

If your Dockerfile isn’t at repo root, update DOCKER_CONTEXT/DOCKERFILE in the workflow.

## Development Notes
- Day counting is inclusive (today = day 1)
- IA returns a short, realistic, motivational phrase
- Bottom navigation for app pages; hidden on auth screens
- SW is network‑first for navigations to reflect live sessions

## Troubleshooting
- Old UI? In DevTools → Application → Service Workers: Update → Skip waiting → Reload. Or clear site data.
- Session not seen on home? Ensure redirects happen after req.session.save completes and SW isn’t serving cached HTML.
- MySQL issues? Verify .env credentials and DB is running (compose/local).

## License
MIT © 2025