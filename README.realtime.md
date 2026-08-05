# HECTRON Realtime

Capa de tiempo real para texto, audio, señalización y sesiones persistentes.

## Incluye

- WebSocket realtime
- Sesiones persistentes
- Registro de eventos realtime
- Pipeline para audio
- Señalización básica lista para WebRTC/LiveKit
- Avatar frame básico

## Endpoints

### WebSocket
- `/ws/realtime/{user_id}`
- `/ws/voice/{user_id}`

### HTTP
- `GET /realtime/sessions/{session_id}`
- `GET /realtime/users/{user_id}/sessions`
- `GET /realtime/sessions/{session_id}/events`
- `POST /realtime/sessions/{session_id}/close`

## Mensajes soportados en WebSocket

- `start`
- `ping`
- `text_message`
- `offer`
- `candidate`
- `bye`

## Flujo

1. El cliente abre WebSocket.
2. El backend crea una sesión realtime.
3. El cliente envía `start`.
4. Si llega texto, el agente responde y retorna avatar.
5. Si llega audio, el backend lo acumula, transcribe y responde.
6. Cada evento se guarda en `realtime_events`.

## Uso

```bash
docker compose up --build
