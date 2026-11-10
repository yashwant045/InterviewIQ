from typing import List, Optional
from pydantic import BaseModel, Field

class GenerateQuestionsRequest(BaseModel):
    role: str = Field(..., example="Senior Full Stack Engineer")
    company: str = Field(..., example="Google")
    difficulty: str = Field(..., example="Senior")
    type: str = Field("Technical", example="Technical")
    skills: List[str] = Field(default_factory=list)
    resumeText: Optional[str] = None
    count: int = Field(3, ge=1, le=10)

class QuestionItem(BaseModel):
    order_index: int
    question_text: str
    topic: str
    difficulty: str
    type: str = "technical"
    starter_code: Optional[str] = None
    ideal_answer: Optional[str] = None

class GenerateQuestionsResponse(BaseModel):
    role: str
    company: str
    difficulty: str
    questions: List[QuestionItem]

class EvaluateAnswerRequest(BaseModel):
    role: str
    company: str
    question_text: str
    answer: str
    code_submitted: Optional[str] = None
    difficulty: str = "Mid-Level"
    ideal_answer: Optional[str] = None

class RadarAdjustments(BaseModel):
    professionalism: float
    attitude: float
    creativity: float
    communication: float
    leadership: float
    teamwork: float

class WorkmapScores(BaseModel):
    presentation: float
    opportunistic: float
    businessAcumen: float
    closingTechnique: float

class EvaluateAnswerResponse(BaseModel):
    score: float
    feedback: str
    follow_up_question: Optional[str] = None
    radar_adjustments: RadarAdjustments
    workmap_scores: WorkmapScores

class AnswerPair(BaseModel):
    question: str
    answer: str
    score: float

class GenerateReportRequest(BaseModel):
    role: str
    company: str
    difficulty: str
    answers: List[AnswerPair]

class GenerateReportResponse(BaseModel):
    overall_score: float
    technical_score: float
    communication_score: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    detailed_summary: str
    radar: RadarAdjustments
    workmap: WorkmapScores

