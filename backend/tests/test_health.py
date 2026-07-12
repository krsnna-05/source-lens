"""Health endpoint tests."""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """Test health check endpoint.

    Args:
        client: TestClient fixture for making requests.

    Asserts:
        - Response status code is 200
        - Response contains 'healthy' status
        - Response contains version information
    """
    response = client.get("/api/v1/health/")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
