"""
Re-export evaluator functions and prompts for root-level import convenience.
Allows both `from evaluator import evaluate_candidate_answer`
and `from app.services.evaluator import evaluate_candidate_answer`.
"""

from app.services.evaluator import (
    evaluate_candidate_answer,
    ANSWER_EVALUATOR_SYSTEM_PROMPT,
)

__all__ = [
    "evaluate_candidate_answer",
    "ANSWER_EVALUATOR_SYSTEM_PROMPT",
]
