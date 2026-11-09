from fastapi import APIRouter
from app.schemas.schemas import (
    GenerateQuestionsRequest, GenerateQuestionsResponse,
    EvaluateAnswerRequest, EvaluateAnswerResponse,
    GenerateReportRequest, GenerateReportResponse
)
from app.services.llm_service import llm_service

router = APIRouter(prefix="/api/ai", tags=["AI Interview Engine"])

@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions_endpoint(req: GenerateQuestionsRequest):
    questions = llm_service.generate_questions(req)
    return GenerateQuestionsResponse(
        role=req.role,
        company=req.company,
        difficulty=req.difficulty,
        questions=questions
    )

@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
def evaluate_answer_endpoint(req: EvaluateAnswerRequest):
    return llm_service.evaluate_answer(req)

@router.post("/generate-report", response_model=GenerateReportResponse)
def generate_report_endpoint(req: GenerateReportRequest):
    return llm_service.generate_report(req)

