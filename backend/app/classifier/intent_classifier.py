"""
Intent Classification Engine for RouteMind.
Deterministic, keyword-based classifier that acts as a placeholder for future AI-based classifications.
"""

import re
from abc import ABC, abstractmethod
from typing import List, Set
from pydantic import BaseModel, Field


class IntentResult(BaseModel):
    """
    Standardized classification response model representing the classified intent details.
    """

    intent: str = Field(..., description="The classified task category/intent.")
    confidence: float = Field(..., description="Confidence score from 0.0 to 100.0.")
    matched_keywords: List[str] = Field(..., description="List of matched keywords.")
    classification_reason: str = Field(
        ..., description="Rationale for this classification."
    )


class BaseIntentClassifier(ABC):
    """
    Abstract contract for all intent classifiers in RouteMind.
    Enables swapping rule-based classifiers for LLM-based ones in the future.
    """

    @abstractmethod
    def classify(self, message: str) -> IntentResult:
        """
        Analyzes user input message to determine user intent.

        Args:
            message: User prompt string.

        Returns:
            IntentResult containing classified intent metadata.
        """
        pass


class RuleBasedIntentClassifier(BaseIntentClassifier):
    """
    Lightweight rule-based intent classifier using keyword heuristics.
    """

    def __init__(self) -> None:
        # Standardized lists of lowercase keywords for each intent
        self._keyword_rules = {
            "coding": {
                "code",
                "debug",
                "python",
                "javascript",
                "react",
                "html",
                "css",
                "programming",
                "compile",
                "function",
                "class",
                "bug",
                "git",
                "api",
                "json",
                "develop",
                "algorithm",
            },
            "writing": {
                "write",
                "essay",
                "email",
                "draft",
                "poem",
                "story",
                "paragraph",
                "letter",
                "blog",
                "compose",
                "editorial",
                "article",
                "text",
                "copywrite",
            },
            "document": {
                "summarize",
                "pdf",
                "docx",
                "document",
                "file",
                "xlsx",
                "csv",
                "txt",
                "parse",
            },
            "research": {
                "research",
                "analyze",
                "explain",
                "scientific",
                "discover",
                "study",
                "concept",
                "history",
                "literature",
                "theory",
                "investigate",
                "compare",
                "context",
            },
            "math": {
                "solve",
                "x²",
                "equation",
                "math",
                "calculate",
                "integral",
                "derivative",
                "plus",
                "minus",
                "algebra",
                "calculus",
                "arithmetic",
                "geometry",
                "formula",
            },
            "image": {
                "image",
                "draw",
                "paint",
                "picture",
                "render",
                "diagram",
                "photo",
                "graphic",
                "visual",
                "generate image",
                "portrait",
                "sketch",
            },
        }
        self._fallback_intent = "general"

    def classify(self, message: str) -> IntentResult:
        """
        Calculates user intent using word boundary matches for exact keywords.
        Confidence scales with number of keywords matched.

        Args:
            message: User prompt to evaluate.

        Returns:
            IntentResult standard schema.
        """
        # Clean and tokenize message
        cleaned_message = message.lower().strip()
        words = set(re.findall(r"\b\w+\b", cleaned_message))
        # Handle special keywords containing non-alphanumeric chars (like x²)
        for special_char in ["x²", "generate image"]:
            if special_char in cleaned_message:
                words.add(special_char)

        best_intent = self._fallback_intent
        max_matches = 0
        best_matched_keywords: Set[str] = set()

        # Check keyword overlaps for each configured intent category
        for intent, keywords in self._keyword_rules.items():
            intersection = words.intersection(keywords)
            matches_count = len(intersection)
            if matches_count > max_matches:
                max_matches = matches_count
                best_intent = intent
                best_matched_keywords = intersection

        # Compute confidence score dynamically
        if max_matches == 0:
            confidence = 50.0
            reason = "No matching keywords found. Defaulting to general intent."
        else:
            # Baseline is 80.0% for matching one keyword, plus 5.0% for each additional, capped at 100.0%
            confidence = min(80.0 + (max_matches - 1) * 5.0, 100.0)
            reason = (
                f"Matched {max_matches} keyword(s) for intent '{best_intent}': "
                f"{sorted(list(best_matched_keywords))}."
            )

        return IntentResult(
            intent=best_intent,
            confidence=confidence,
            matched_keywords=sorted(list(best_matched_keywords)),
            classification_reason=reason,
        )
