"""Pytest fixtures for testing."""

import pytest
from fastapi.testclient import TestClient

from app.main import app_instance


@pytest.fixture
def client() -> TestClient:
    """Fixture providing TestClient for FastAPI application.

    Returns:
        TestClient: Test client for making requests to the application.
    """
    return TestClient(app_instance)
