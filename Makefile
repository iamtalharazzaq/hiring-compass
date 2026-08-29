.PHONY: up down restart logs ps clean serve seed-up seed-down local local-stop

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps

serve:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

clean:
	# Removes only named volumes declared by this Compose project.
	docker compose down -v

seed-up:
	cd backend && uv run alembic upgrade head && uv run python -m app.cli.seed up

seed-down:
	test "$(CONFIRM)" = "DELETE_SEED_DATA" || (echo "Use: make seed-down CONFIRM=DELETE_SEED_DATA" && exit 1)
	cd backend && uv run python -m app.cli.seed down --confirm "$(CONFIRM)"

local: up
	cd backend && uv sync && uv run alembic upgrade head && uv run python -m app.cli.seed up
	trap 'kill 0' INT TERM EXIT; \
	(cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) & \
	(cd frontend && if [ ! -d node_modules ]; then npm install; fi && npm run dev -- --host 0.0.0.0)

local-stop:
	docker compose stop postgres redis rabbitmq minio mailpit
