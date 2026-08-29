# Hiring Compass

Hiring Compass is an AI-assisted recruitment platform for helping teams run a more focused hiring process.

## Status

**Phase 1.5 — Authentication.** This repository has secure identity authentication with short-lived in-memory access tokens and rotating HTTP-only refresh cookies.

## Repository structure

```text
.
├── backend/                 # Reserved for the FastAPI application
├── frontend/                # Reserved for the React application
├── docs/
│   ├── adr/                 # Architecture decision records
│   ├── api/                 # API documentation
│   └── architecture/        # Architecture documentation
├── .env.example
├── docker-compose.yml
└── Makefile
```

## Prerequisites

- Git
- Docker and Docker Compose
- Node.js current LTS (for later frontend phases)
- Python 3.12+ (for later backend phases)

## Setup

```bash
cp .env.example .env
make up
make ps
```

Stop the local services with:

```bash
make down
```

## Run the API locally

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API provides liveness at [http://localhost:8000/health](http://localhost:8000/health), database readiness at [http://localhost:8000/health/ready](http://localhost:8000/health/ready), and Swagger documentation at [http://localhost:8000/docs](http://localhost:8000/docs). You can also run the API from the repository root with `make local`.

## Local services

| Service | Purpose | Access |
| --- | --- | --- |
| PostgreSQL | Primary relational database | `localhost:5432` |
| Redis | Cache, rate limiting, and short-lived state | `localhost:6379` |
| RabbitMQ | Background-task broker | [Management UI](http://localhost:15672) |
| MinIO | Private S3-compatible resume storage | [Console](http://localhost:9001) |
| Mailpit | Local SMTP sandbox | [Inbox](http://localhost:8025) |

Use the RabbitMQ and MinIO credentials from your `.env` file to sign in.

## Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at [http://localhost:5173](http://localhost:5173). It includes authentication screens and the protected workspace preview; hiring workflows arrive in later phases.

Authentication endpoints: `POST /api/v1/auth/signup`, `login`, `refresh`, and `logout`; `GET /api/v1/auth/me`. Access tokens are short-lived and retained only in browser memory. Refresh tokens are opaque, rotated, and sent only in HTTP-only cookies.

## Roadmap

- [x] Phase 1.1 — Repository Bootstrap
- [x] Phase 1.2 — Backend Skeleton
- [x] Phase 1.3 — Persistence Foundation
- [x] Phase 1.4 — Frontend Foundation
- [x] Phase 1.5 — Authentication
- [ ] Phase 1.6 — Organization and RBAC
