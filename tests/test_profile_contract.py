from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_profile_contract():
    user_id = str(uuid4())
    res = client.get(f"/users/{user_id}/profile")
    assert res.status_code == 200
    body = res.json()
    assert body["user_id"] == user_id
