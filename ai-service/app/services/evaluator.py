"""
InterviewIQ AI Service - Candidate Answer Evaluator
Compares candidate responses directly against benchmark model solutions using LLM structured outputs.
"""

from typing import Optional

try:
    from app.schemas.schemas import GeneratedQuestion, AnswerEvaluation
    from app.services.llm_client import call_llm_json
except ImportError:
    from schemas import GeneratedQuestion, AnswerEvaluation
    from llm_client import call_llm_json


# ==========================================
# Exact System Prompt Definition
# ==========================================

ANSWER_EVALUATOR_SYSTEM_PROMPT = """
You are a Staff Technical Evaluator and Hiring Bar Raiser for InterviewIQ.

Your task is to conduct an objective, granular, and comparative evaluation of a candidate's answer against the canonical benchmark solution.

Evaluation Directives:
1. Direct Benchmark Comparison:
   - Compare the candidate_answer directly and rigorously against the question's expected_ideal_answer.
   - Grade technical accuracy strictly based on omitted architectural components, incorrect algorithmic complexity, logical flaws, or unhandled edge cases.
   - Factually incorrect, evasive, or 'I don't know' responses must receive a low score (0-20), never a passing baseline.
   - Scores above 85 are reserved for candidates who thoroughly explain architecture, mechanisms, and operational trade-offs.

2. Communication & Structural Rigor (0-100):
   - Evaluate articulation, structure, conciseness, and precision of technical vocabulary.
   - For behavioral questions, verify application of the STAR method (Situation, Task, Action, Result).
   - Penalize hand-waving, rambling, or excessive filler.

3. Follow-Up Trigger (needs_followup):
   - Set 'needs_followup' to TRUE ONLY IF the candidate partially answered the question (technical score roughly 35-65) but omitted a critical architectural mechanism or trade-off that deserves immediate probing.
   - Set 'needs_followup' to FALSE if the candidate gave an exhaustive answer (score >= 75) OR if the candidate gave an evasive, non-technical, or completely wrong answer (score < 30), where the interview should transition to the next topic.
   - When 'needs_followup' is TRUE, generate a concise, incisive 'followup_question'. When FALSE, set 'followup_question' to null.

4. Missing Keywords & Omissions:
   - Identify 2-5 explicit technical terms, protocols, or architectural patterns from the expected_ideal_answer that the candidate failed to articulate.

5. Speech-Friendly Constructive Feedback:
   - Provide a concise 2-3 sentence feedback string that can be displayed cleanly in the UI or synthesized into speech by the AI avatar.
   - State what was addressed and clearly highlight the primary missing component.
""".strip()


def evaluate_candidate_answer(
    question: GeneratedQuestion,
    candidate_answer: str,
) -> AnswerEvaluation:
    """
    Evaluates a candidate's spoken or written answer against the question's expected ideal answer.

    Parameters:
    - question (GeneratedQuestion): The question object containing question_text, topic, and expected_ideal_answer.
    - candidate_answer (str): The transcript of the candidate's spoken or written response.

    Returns:
    - AnswerEvaluation: Strictly validated Pydantic model containing technical_score, communication_score,
      feedback, missing_keywords, needs_followup, and optional followup_question.
    """
    cleaned_answer = (candidate_answer or "").strip()
    if not cleaned_answer:
        cleaned_answer = "[No spoken or written answer provided by candidate]"

    user_prompt = f"""
Evaluation Task:
Question Text:
{question.question_text}

Topic:
{question.topic}

Expected Ideal Answer (Canonical Benchmark):
{question.expected_ideal_answer}

Candidate Submitted Answer:
{cleaned_answer}

Directives:
1. Compare the candidate's submitted answer directly against the expected ideal answer.
2. Deduct technical points strictly for missing concepts or flawed logic.
3. Grade communication on clarity and structure.
4. Set needs_followup to True ONLY if the candidate partially answered with some technical substance but missed critical depth.
5. Identify all missing keywords/concepts.
6. Return a concise, speech-friendly feedback string.
""".strip()

    # Invoke LLM enforcing AnswerEvaluation structured output schema
    evaluation: AnswerEvaluation = call_llm_json(
        system_prompt=ANSWER_EVALUATOR_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_model=AnswerEvaluation,
    )

    return evaluation

