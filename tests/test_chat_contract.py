from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_chat_contract():
    payload = {
        "user_id": str(uuid4()),
        "text": "Hola, quiero empezar un proyecto",
    }
    res = client.post("/chat", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert "conversation_id" in body
    assert "reply" in body
