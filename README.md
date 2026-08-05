# HECTRON

Motor cognitivo para agentes inteligentes con memoria persistente.

---

# Arquitectura

FastAPI

PostgreSQL

pgvector

SQLAlchemy

Alembic

Docker

---

# Requisitos

Docker Desktop

Python 3.12+

Git

---

# Clonar

git clone https://github.com/usuario/hectron.git

cd hectron

---

# Configurar

Copiar

.env.example

como

.env

---

# Levantar todo

docker compose up --build

La primera ejecución descarga PostgreSQL.

---

# API

http://localhost:8000

Swagger

http://localhost:8000/docs

Redoc

http://localhost:8000/redoc

---

# Migraciones

Crear

alembic revision --autogenerate -m "mensaje"

Aplicar

alembic upgrade head

---

# Base de datos

Host

localhost

Puerto

5432

Usuario

postgres

Password

postgres

Base

hectron

---

# Estructura

app/

api/

models/

repositories/

services/

memory/

agent/

llm/

db/

core/

schemas/

---

# Endpoints

GET /health

POST /chat

POST /memories

GET /users/{id}/memories

---

# Arrancar manualmente

uvicorn app.main:app --reload

---

# Ejecutar pruebas

pytest

---

# Roadmap

✔ Chat

✔ Memoria

✔ pgvector

✔ Planner

✔ Curiosity

⬜ Voz

⬜ Avatar

⬜ VideoChat

⬜ Live Streaming

⬜ Multiagente

⬜ Simulación económica

⬜ Marketplace

---

HECTRON v0.1

Siguiente paso

A partir de aquí ya no construiría el proyecto como un chatbot convencional. El siguiente bloque sería un núcleo cognitivo compuesto por aproximadamente 25 000 líneas de código, dividido en unos 50 módulos, incluyendo:

Cognitive Core (bucle de pensamiento del agente).

Attention Engine (decide qué información merece atención).

Curiosity Engine (genera preguntas espontáneas).

Emotion Engine (estado emocional persistente).

Long-Term Memory con consolidación y olvido.

Planning Engine (objetivos a corto y largo plazo).

Reflection Engine (autoevaluación tras conversaciones).

Video Call Engine (voz, cámara y sincronización labial).

Avatar Engine (expresiones, mirada y gestos).

World Model (representación del usuario y del entorno).


Ese sería el punto donde HECTRON dejaría de comportarse como un chatbot y empezaría a actuar como un agente cognitivo persistente capaz de evolucionar con cada interacción.
