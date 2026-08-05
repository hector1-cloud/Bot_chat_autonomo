.PHONY: up down build logs api migrate revision test format lint

up:
	docker compose up --build

down:
	docker compose down -v

build:
	docker compose build

logs:
	docker compose logs -f

api:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	alembic upgrade head

revision:
	alembic revision --autogenerate -m "$(MSG)"

test:
	pytest -q

format:
	ruff format .

lint:
	ruff check .
