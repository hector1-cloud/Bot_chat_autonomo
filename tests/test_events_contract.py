from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_events_contract():
    user_id = str(uuid4())
    payload = {
        "user_id": user_id,
        "type": "USER_CONNECTED",
        "payload": "Sesión iniciada",
    }
    res = client.post("/events", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["type"] == "USER_CONNECTED"
