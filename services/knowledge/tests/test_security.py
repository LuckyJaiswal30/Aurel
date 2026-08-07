from fastapi.testclient import TestClient

from knowledge.main import app
from knowledge.settings import get_settings

client = TestClient(app)


def test_document_routes_refuse_requests_without_the_service_token() -> None:
    response = client.post("/documents/00000000-0000-0000-0000-000000000000/preview")
    assert response.status_code == 401


def test_document_routes_refuse_a_wrong_token() -> None:
    response = client.post(
        "/documents/00000000-0000-0000-0000-000000000000/read",
        headers={"Authorization": "Bearer not-the-token"},
    )
    assert response.status_code == 401


def test_settings_keep_the_token_secret() -> None:
    assert "**********" in repr(get_settings().service_token)
