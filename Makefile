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
	@echo "No application is available to run locally in Phase 1.1; use 'make up' for local dependencies."

clean:
	# Removes only named volumes declared by this Compose project.
	docker compose down -v
