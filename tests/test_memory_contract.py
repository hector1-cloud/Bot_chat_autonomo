from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_memory_contract():
    user_id = str(uuid4())
    payload = {
        "user_id": user_id,
        "type": "episodic",
        "summary": "Le gusta programar videojuegos",
        "importance": 0.8,
        "embedding": None,
    }
    res = client.post("/memories", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["summary"] == payload["summary"]
