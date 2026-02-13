# Zarket Places

AI Tools Registry — NestJS SSR Monolith with DynamoDB.

## Tech Stack

- **Framework:** NestJS (SSR with Handlebars)
- **Styling:** Tailwind CSS (CDN)
- **Database:** AWS DynamoDB (Single Table Design)
- **Auth:** Google OAuth 2.0 (planned)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS CLI (for DynamoDB table init)

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start DynamoDB Local + App
docker compose up -d

# 3. Initialize DynamoDB table & seed data (first time only)
bash scripts/init-dynamodb.sh

# 4. Open browser
open http://localhost:3000
```

## Local Development (without Docker)

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start dev server with watch mode |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## Project Structure

```
src/
├── main.ts                  # Bootstrap, view engine setup
├── app.module.ts            # Root module
├── app.controller.ts        # GET / (main listing page)
├── dynamodb/
│   ├── dynamodb.module.ts   # Global DynamoDB module
│   └── dynamodb.service.ts  # DynamoDB client & helpers
├── health/
│   ├── health.module.ts
│   └── health.controller.ts # GET /health (with DB check)
├── items/
│   ├── items.module.ts
│   ├── items.controller.ts  # /items/new, /items/:id
│   └── items.service.ts     # Item CRUD (placeholder)
├── auth/                    # Google OAuth (future)
└── config/                  # Configuration (future)
views/
├── layouts/main.hbs         # Base layout with Tailwind CDN
├── index.hbs                # Main listing page
├── items/
│   ├── new.hbs              # Registration form
│   ├── detail.hbs           # Item detail page
│   └── edit.hbs             # Edit form (placeholder)
└── error.hbs                # Error page
```

## Docker

- **Development:** `docker compose up` (uses `target: development`)
- **Production build:** `docker build --target production -t zarketplace .`

## Health Check

```
GET /health → { "status": "ok", "db": "connected", "timestamp": "..." }
```
