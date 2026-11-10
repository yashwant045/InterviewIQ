"""
InterviewIQ AI Service - Dynamic Question Generator
Generates tailored interview questions and adaptive follow-ups using LLM structured outputs.
"""

import json
from typing import List, Optional, Dict, Any

try:
    from app.schemas.schemas import InterviewContext, GeneratedQuestion, AnswerEvaluation
    from app.services.llm_client import call_llm_json
except ImportError:
    from schemas import InterviewContext, GeneratedQuestion, AnswerEvaluation
    from llm_client import call_llm_json


# ==========================================
# Exact System Prompt Definition
# ==========================================

QUESTION_GENERATOR_SYSTEM_PROMPT = """
You are a Principal Technical Interviewer conducting a world-class technical and behavioral interview for {company} targeting the {role} position.

Your objectives:
1. Role & Company Persona: Embody the engineering culture, hiring standards, and architectural expectations of {company} for the role of {role}.
2. Calibrated Difficulty: Precisely tune the technical depth, rigor, and complexity to the candidate's target seniority level: {difficulty}.
   - Junior: Fundamental data structures, basic API design, clean code, error handling.
   - Mid-Level: Scalable component design, concurrency, database indexing, caching strategies.
   - Senior/Lead: High-throughput distributed systems, fault tolerance, consistency trade-offs, capacity estimation, leadership.
3. Resume Grounding: Naturally incorporate and cross-examine the candidate's declared skills and experiences from their resume: {parsed_resume_skills}.
4. Adaptive Conversational Flow:
   - If previous_evaluation indicates 'needs_followup' is TRUE: Do NOT change the subject. Formulate an incisive, probing follow-up question that directly challenges the candidate on their missing concepts and unaddressed trade-offs ({missing_keywords}).
   - If previous_evaluation indicates 'needs_followup' is FALSE: Seamlessly transition to a new relevant technical, architectural, coding, or behavioral dimension that has not yet been explored in the conversation history.
5. Internal Benchmark Solution: You must always author a comprehensive, high-caliber 'expected_ideal_answer' containing the canonical architecture, algorithmic breakdown, and production edge cases that will be used internally by the evaluation engine to grade the candidate.
6. Coding Flag: Set 'requires_code' to true if the question requires the candidate to write algorithmic code or functional implementation in the editor, and provide starter_code if appropriate. Otherwise set 'requires_code' to false.
7. Followup Flag: Set 'is_followup' to true if this is an adaptive probe on the previous answer, or false if it is a fresh primary question.
""".strip()


def generate_next_question(
    context: InterviewContext,
    chat_history: List[Dict[str, Any]],
    previous_evaluation: Optional[AnswerEvaluation] = None,
) -> GeneratedQuestion:
    """
    Generates the next interview question or probing follow-up based on the candidate's context,
    prior conversation history, and evaluation results.

    Parameters:
    - context (InterviewContext): Role, company, difficulty, and resume skills.
    - chat_history (List[dict]): List of past conversation turns (role, content).
    - previous_evaluation (Optional[AnswerEvaluation]): Evaluation result of the candidate's last answer.

    Returns:
    - GeneratedQuestion: Validated Pydantic model enforcing structured output.
    """
    # 1. Format the dynamic system prompt with context parameters
    skills_formatted = (
        ", ".join(context.parsed_resume_skills)
        if context.parsed_resume_skills
        else "Modern Full-Stack, System Architecture, Algorithms"
    )

    system_prompt = QUESTION_GENERATOR_SYSTEM_PROMPT.format(
        company=context.company,
        role=context.role,
        difficulty=context.difficulty,
        parsed_resume_skills=skills_formatted,
        missing_keywords=(
            ", ".join(previous_evaluation.missing_keywords)
            if previous_evaluation and previous_evaluation.missing_keywords
            else "N/A"
        ),
    )

    # 2. Format the user prompt including conversation history and prior evaluation
    history_summary = []
    for turn in chat_history[-6:]:  # Keep recent context bounded
        sender = turn.get("role") or turn.get("sender") or "participant"
        content = turn.get("content") or turn.get("message") or ""
        history_summary.append(f"- {sender.capitalize()}: {content}")

    history_str = "\n".join(history_summary) if history_summary else "No prior turns. Let's begin the interview."

    evaluation_details = ""
    if previous_evaluation:
        evaluation_details = f"""
Previous Turn Evaluation:
- Technical Score: {previous_evaluation.technical_score}/100
- Communication Score: {previous_evaluation.communication_score}/100
- Feedback Given: {previous_evaluation.feedback}
- Missing Concepts/Keywords: {', '.join(previous_evaluation.missing_keywords) if previous_evaluation.missing_keywords else 'None'}
- Needs Followup: {previous_evaluation.needs_followup}
""".strip()
    else:
        evaluation_details = "Previous Turn Evaluation: None (First question of the session)."

    instruction = ""
    if previous_evaluation and previous_evaluation.needs_followup:
        instruction = (
            "CRITICAL DIRECTIVE: The candidate's previous response was incomplete or missing key concepts. "
            f"Generate a targeted follow-up question probing into: {', '.join(previous_evaluation.missing_keywords)}. "
            "Set is_followup=True."
        )
    else:
        instruction = (
            "DIRECTIVE: Generate the next primary interview question. Move to a new topic (e.g. system design, "
            "distributed architecture, concurrency, or core algorithms) relevant to the candidate's skills and target role. "
            "Set is_followup=False."
        )

    user_prompt = f"""
Candidate Context:
- Target Role: {context.role}
- Target Company: {context.company}
- Seniority Level: {context.difficulty}
- Resume Skills: {skills_formatted}

Recent Interview Conversation History:
{history_str}

{evaluation_details}

{instruction}
""".strip()

    # 3. Invoke LLM enforcing the GeneratedQuestion structured JSON schema
    generated: GeneratedQuestion = call_llm_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=GeneratedQuestion,
    )

    return generated
