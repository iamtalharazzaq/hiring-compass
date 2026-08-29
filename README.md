# Hiring Compass

Hiring Compass is an AI-assisted recruitment platform for helping teams run a more focused hiring process.

## Status

**Phase 1.1 — Repository Bootstrap.** This repository is a modular monolith: a future React frontend and FastAPI backend will share PostgreSQL and the local supporting services defined here.

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

There is no application process to run without Docker in Phase 1.1. `make local` explains this and points to the local dependency command; a native frontend/backend command will be added once those applications exist.

## Local services

| Service | Purpose | Access |
| --- | --- | --- |
| PostgreSQL | Primary relational database | `localhost:5432` |
| Redis | Cache, rate limiting, and short-lived state | `localhost:6379` |
| RabbitMQ | Background-task broker | [Management UI](http://localhost:15672) |
| MinIO | Private S3-compatible resume storage | [Console](http://localhost:9001) |
| Mailpit | Local SMTP sandbox | [Inbox](http://localhost:8025) |

Use the RabbitMQ and MinIO credentials from your `.env` file to sign in.

FastAPI and React implementation begin in later sub-phases; this phase starts only the local dependencies.

## Roadmap

- [x] Phase 1.1 — Repository Bootstrap
- [ ] Phase 1.2 — Backend Skeleton
