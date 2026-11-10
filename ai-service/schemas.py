"""
Re-export schemas for convenience and backward compatibility.
Allows both `from schemas import ...` and `from app.schemas.schemas import ...`.
"""

from app.schemas.schemas import (
    InterviewContext,
    GeneratedQuestion,
    GeneratedQuestionList,
    AnswerEvaluation,
    RadarScores,
    WorkmapScores,
    InterviewReport,
    QuestionItem,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    EvaluateAnswerRequest,
    RadarAdjustments,
    EvaluateAnswerResponse,
    AnswerPair,
    GenerateReportRequest,
    GenerateReportResponse,
)

__all__ = [
    "InterviewContext",
    "GeneratedQuestion",
    "GeneratedQuestionList",
    "AnswerEvaluation",
    "RadarScores",
    "WorkmapScores",
    "InterviewReport",
    "QuestionItem",
    "GenerateQuestionsRequest",
    "GenerateQuestionsResponse",
    "EvaluateAnswerRequest",
    "RadarAdjustments",
    "EvaluateAnswerResponse",
    "AnswerPair",
    "GenerateReportRequest",
    "GenerateReportResponse",
]

