"""
Re-export question_generator functions and prompts for root-level import convenience.
Allows both `from question_generator import generate_next_question`
and `from app.services.question_generator import generate_next_question`.
"""

from app.services.question_generator import (
    generate_next_question,
    generate_resume_based_question,
    QUESTION_GENERATOR_SYSTEM_PROMPT,
)

__all__ = [
    "generate_next_question",
    "generate_resume_based_question",
    "QUESTION_GENERATOR_SYSTEM_PROMPT",
]

