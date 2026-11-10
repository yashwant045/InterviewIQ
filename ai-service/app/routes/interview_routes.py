from fastapi import APIRouter
from app.schemas.schemas import (
    GenerateQuestionsRequest, GenerateQuestionsResponse,
    EvaluateAnswerRequest, EvaluateAnswerResponse,
    GenerateReportRequest, GenerateReportResponse,
    InterviewContext, GeneratedQuestion
)
from app.services.llm_service import llm_service
from app.services.question_generator import generate_resume_based_question

router = APIRouter(tags=["AI Interview Engine"])

@router.post("/api/ai/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions_endpoint(req: GenerateQuestionsRequest):
    questions = llm_service.generate_questions(req)
    return GenerateQuestionsResponse(
        role=req.role,
        company=req.company,
        difficulty=req.difficulty,
        questions=questions
    )

@router.post("/api/ai/evaluate-answer", response_model=EvaluateAnswerResponse)
def evaluate_answer_endpoint(req: EvaluateAnswerRequest):
    return llm_service.evaluate_answer(req)

@router.post("/api/ai/generate-report", response_model=GenerateReportResponse)
def generate_report_endpoint(req: GenerateReportRequest):
    return llm_service.generate_report(req)

@router.post("/api/ai/resume-question", response_model=GeneratedQuestion)
@router.post("/api/interview/resume-question", response_model=GeneratedQuestion)
def resume_question_endpoint(context: InterviewContext):
    """Generates a targeted resume deep-dive question explicitly referencing candidate's past projects."""
    return generate_resume_based_question(context)


