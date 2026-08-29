.PHONY: up down restart logs ps clean local

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

local:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

clean:
	# Removes only named volumes declared by this Compose project.
	docker compose down -v
