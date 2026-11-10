"""
Re-export report_generator functions and prompts for root-level import convenience.
Allows both `from report_generator import generate_final_report`
and `from app.services.report_generator import generate_final_report`.
"""

from app.services.report_generator import (
    generate_final_report,
    REPORT_GENERATOR_SYSTEM_PROMPT,
)

__all__ = [
    "generate_final_report",
    "REPORT_GENERATOR_SYSTEM_PROMPT",
]

