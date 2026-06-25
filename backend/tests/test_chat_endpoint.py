"""
Integration tests for the RouteMind /chat and /health API endpoints.
Uses FastAPI TestClient to exercise the full pipeline: validation → classification → routing → response.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Creates a TestClient for the FastAPI app."""
    return TestClient(app)


class TestHealthEndpoints:
    """Tests for the health and root endpoints."""

    def test_root_returns_welcome(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert data["status"] == "online"

    def test_health_returns_healthy(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data


class TestChatEndpointValidation:
    """Tests for request validation on POST /chat."""

    def test_empty_message_rejected(self, client):
        response = client.post("/chat", json={"message": ""})
        assert response.status_code == 422

    def test_whitespace_message_rejected(self, client):
        response = client.post("/chat", json={"message": "   "})
        assert response.status_code in (400, 422)

    def test_missing_message_rejected(self, client):
        response = client.post("/chat", json={})
        assert response.status_code == 422

    def test_invalid_routing_policy_rejected(self, client):
        response = client.post(
            "/chat",
            json={"message": "hello", "routing_policy": "invalid_policy"},
        )
        assert response.status_code == 422

    def test_valid_policies_accepted(self, client):
        for policy in ["balanced", "speed", "cost", "quality"]:
            response = client.post(
                "/chat",
                json={"message": "test query", "routing_policy": policy},
            )
            assert response.status_code == 200, f"Policy '{policy}' should be accepted"


class TestChatEndpointPipeline:
    """Tests for the full /chat routing pipeline (with mock fallback)."""

    def test_successful_response_structure(self, client):
        response = client.post("/chat", json={"message": "debug my python code"})
        assert response.status_code == 200
        data = response.json()

        # Check top-level structure
        assert "response" in data
        assert "routing" in data
        assert "metadata" in data

    def test_response_detail_fields(self, client):
        response = client.post("/chat", json={"message": "write a poem about AI"})
        data = response.json()

        resp = data["response"]
        assert "content" in resp
        assert len(resp["content"]) > 0
        assert "conversation_id" in resp

    def test_routing_detail_fields(self, client):
        response = client.post("/chat", json={"message": "explain transformers"})
        data = response.json()

        routing = data["routing"]
        assert "intent" in routing
        assert "provider" in routing
        assert "selected_model" in routing
        assert "routing_policy" in routing
        assert "confidence" in routing
        assert "reason" in routing
        assert "estimated_cost" in routing
        assert "processing_time_ms" in routing

    def test_metadata_detail_fields(self, client):
        response = client.post("/chat", json={"message": "hello"})
        data = response.json()

        meta = data["metadata"]
        assert "request_id" in meta
        assert meta["request_id"].startswith("req_")
        assert "timestamp" in meta
        assert meta["status"] == "success"
        assert "api_version" in meta

    def test_coding_query_routes_to_coding_intent(self, client):
        response = client.post("/chat", json={"message": "debug this python function"})
        data = response.json()
        assert data["routing"]["intent"] == "coding"

    def test_writing_query_routes_to_writing_intent(self, client):
        response = client.post("/chat", json={"message": "write an email draft"})
        data = response.json()
        assert data["routing"]["intent"] == "writing"

    def test_quality_policy_reflected_in_response(self, client):
        response = client.post(
            "/chat",
            json={"message": "test query", "routing_policy": "quality"},
        )
        data = response.json()
        assert data["routing"]["routing_policy"] == "quality"

    def test_conversation_id_preserved(self, client):
        response = client.post(
            "/chat",
            json={"message": "test", "conversation_id": "conv_test_123"},
        )
        data = response.json()
        assert data["response"]["conversation_id"] == "conv_test_123"

    def test_attachments_preserved(self, client):
        response = client.post(
            "/chat",
            json={"message": "summarize this", "attachments": ["file.pdf"]},
        )
        data = response.json()
        assert data["response"]["attachments"] == ["file.pdf"]

    def test_confidence_within_valid_range(self, client):
        response = client.post("/chat", json={"message": "debug code"})
        data = response.json()
        assert 0.0 <= data["routing"]["confidence"] <= 100.0

    def test_processing_time_is_positive(self, client):
        response = client.post("/chat", json={"message": "hello"})
        data = response.json()
        assert data["routing"]["processing_time_ms"] >= 0

    def test_estimated_cost_non_negative(self, client):
        response = client.post("/chat", json={"message": "test"})
        data = response.json()
        assert data["routing"]["estimated_cost"] >= 0.0
