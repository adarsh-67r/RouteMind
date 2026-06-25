"""
Unit tests for the RouteMind Intent Classifier.
Tests RuleBasedIntentClassifier with coverage for all intents, confidence scoring,
edge cases, and fallback behavior.
"""

import pytest
from app.classifier.intent_classifier import RuleBasedIntentClassifier, IntentResult


@pytest.fixture
def classifier():
    """Creates a fresh classifier instance for each test."""
    return RuleBasedIntentClassifier()


class TestIntentClassification:
    """Tests for intent detection across all supported categories."""

    def test_coding_intent_single_keyword(self, classifier):
        result = classifier.classify("Help me debug this error")
        assert result.intent == "coding"
        assert "debug" in result.matched_keywords

    def test_coding_intent_multiple_keywords(self, classifier):
        result = classifier.classify("Write a Python function that uses the class API")
        assert result.intent == "coding"
        assert len(result.matched_keywords) >= 2

    def test_writing_intent(self, classifier):
        result = classifier.classify("Write me an email to my manager")
        assert result.intent == "writing"
        assert "email" in result.matched_keywords

    def test_document_intent(self, classifier):
        result = classifier.classify("Summarize this PDF document for me")
        assert result.intent == "document"

    def test_research_intent(self, classifier):
        result = classifier.classify("Research the history of quantum computing")
        assert result.intent == "research"

    def test_math_intent(self, classifier):
        result = classifier.classify("Solve this equation for x using calculus")
        assert result.intent == "math"

    def test_image_intent(self, classifier):
        result = classifier.classify("Generate an image of a sunset landscape")
        assert result.intent == "image"

    def test_general_fallback(self, classifier):
        result = classifier.classify("Hello, how are you today?")
        assert result.intent == "general"

    def test_case_insensitivity(self, classifier):
        result = classifier.classify("DEBUG this PYTHON code NOW")
        assert result.intent == "coding"


class TestConfidenceScoring:
    """Tests for confidence score computation."""

    def test_single_keyword_baseline_confidence(self, classifier):
        result = classifier.classify("debug")
        assert result.confidence == 80.0

    def test_multiple_keywords_higher_confidence(self, classifier):
        result = classifier.classify("debug this python code using the function API")
        assert result.confidence > 80.0

    def test_confidence_capped_at_100(self, classifier):
        # Throw many coding keywords at it
        result = classifier.classify(
            "code debug python javascript react html css programming compile function class bug git api json develop algorithm"
        )
        assert result.confidence == 100.0

    def test_fallback_confidence_is_50(self, classifier):
        result = classifier.classify("hello world")
        assert result.confidence == 50.0


class TestIntentResultSchema:
    """Tests for the IntentResult output shape."""

    def test_returns_intent_result_type(self, classifier):
        result = classifier.classify("test query")
        assert isinstance(result, IntentResult)

    def test_has_required_fields(self, classifier):
        result = classifier.classify("debug python")
        assert result.intent is not None
        assert result.confidence is not None
        assert result.matched_keywords is not None
        assert result.classification_reason is not None

    def test_matched_keywords_are_sorted(self, classifier):
        result = classifier.classify("python debug code function")
        assert result.matched_keywords == sorted(result.matched_keywords)

    def test_classification_reason_not_empty(self, classifier):
        result = classifier.classify("some random query")
        assert len(result.classification_reason) > 0


class TestEdgeCases:
    """Tests for edge cases and boundary conditions."""

    def test_empty_string(self, classifier):
        result = classifier.classify("")
        assert result.intent == "general"
        assert result.confidence == 50.0

    def test_whitespace_only(self, classifier):
        result = classifier.classify("   \n\t  ")
        assert result.intent == "general"

    def test_very_long_input(self, classifier):
        long_msg = "hello world " * 1000
        result = classifier.classify(long_msg)
        assert isinstance(result, IntentResult)

    def test_special_characters(self, classifier):
        result = classifier.classify("!@#$%^&*()")
        assert result.intent == "general"

    def test_ambiguous_query_picks_strongest(self, classifier):
        """When keywords span multiple intents, the one with more matches wins."""
        result = classifier.classify("debug this python code and write a story")
        # coding has more keywords here (debug, python, code) vs writing (write, story)
        assert result.intent == "coding"
