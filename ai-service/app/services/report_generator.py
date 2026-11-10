"""
InterviewIQ AI Service - Final Report Generator
Synthesizes candidate transcripts and turn evaluations into comprehensive executive debriefs using LLM structured outputs.
"""

from typing import List, Dict, Any

try:
    from app.schemas.schemas import InterviewContext, AnswerEvaluation, InterviewReport
    from app.services.llm_client import call_llm_json
except ImportError:
    from schemas import InterviewContext, AnswerEvaluation, InterviewReport
    from llm_client import call_llm_json


# ==========================================
# Exact System Prompt Definition
# ==========================================

REPORT_GENERATOR_SYSTEM_PROMPT = """
You are a Principal Engineering Director and Chief Talent Assessor for InterviewIQ.

Your task is to synthesize the candidate's complete interview trajectory—including full conversational transcripts, technical evaluations, and identified knowledge gaps—into a high-impact, executive-level debrief report.

Reporting Directives:
1. Holistic Overall Score (0-100):
   - Synthesize a unified overall_score calibrated against the target role ({role}) and company ({company}) hiring bar.
   - If no answers were submitted or all questions were skipped/evasive, the overall score must reflect a failing grade (0-15), never an arbitrary passing score.
   - Base the score on technical correctness, depth, problem decomposition, and communication structure.

2. Top 3 Strengths & Top 3 Weaknesses:
   - Identify exactly 3 concrete, evidence-based technical or architectural strengths demonstrated during the interview.
   - Identify exactly 3 critical technical or architectural weaknesses/growth areas with specific references to what was missed or under-explained.

3. 6-Axis Radar Competency Mapping (0-100 scale):
   - Professionalism: Poise, composure, structured delivery, and adherence to professional engineering standards.
   - Attitude: Coachability, transparency regarding unknowns, resilience, and growth mindset.
   - Creativity: Non-obvious problem solving, architectural ingenuity, and consideration of alternative designs.
   - Communication: Articulation clarity, brevity, STAR methodology, and precision of technical vocabulary.
   - Leadership: Technical conviction, ownership, proactive risk mitigation, and strategic thinking.
   - Teamwork: Cross-functional awareness, developer experience empathy, and consensus building.

4. 4-Pillar Workmap Competency Mapping (0-100 scale):
   - Presentation: Impactful communication, visual clarity, and structured thought progression.
   - Opportunistic: Agility, identifying leverage points, and rapid adaptation to hints/edge cases.
   - Business Acumen: Aligning technical trade-offs with business ROI, operational costs, and user SLAs.
   - Closing Technique: Crisp summaries, actionable conclusion synthesis, and decisive problem resolution.

5. Actionable Roadmap & Feedback (actionable_feedback):
   - Provide a highly specific, personalized developmental roadmap detailing exact technologies, architectural patterns, whitepapers, or interview techniques the candidate must master to pass senior rounds at {company}.
""".strip()


def generate_final_report(
    context: InterviewContext,
    full_transcript: List[Dict[str, Any]],
    all_evaluations: List[AnswerEvaluation],
) -> InterviewReport:
    """
    Synthesizes the complete interview history into an executive-level performance debrief.

    Parameters:
    - context (InterviewContext): Target role, company, difficulty, and resume skills.
    - full_transcript (List[dict]): Complete transcript of all questions and candidate answers.
    - all_evaluations (List[AnswerEvaluation]): Turn-by-turn evaluations for all questions.

    Returns:
    - InterviewReport: Validated Pydantic model containing overall_score, strengths, weaknesses,
      radar_scores, workmap_scores, and actionable_feedback.
    """
    skills_formatted = (
        ", ".join(context.parsed_resume_skills)
        if context.parsed_resume_skills
        else "Modern Full-Stack, System Architecture, Algorithms"
    )

    system_prompt = REPORT_GENERATOR_SYSTEM_PROMPT.format(
        company=context.company,
        role=context.role,
        difficulty=context.difficulty,
        parsed_resume_skills=skills_formatted,
    )

    # 1. Format Turn-by-Turn Evaluations
    eval_summaries = []
    for i, ev in enumerate(all_evaluations):
        missing = ", ".join(ev.missing_keywords) if ev.missing_keywords else "None"
        eval_summaries.append(
            f"Question {i + 1} Evaluation:\n"
            f"- Technical Score: {ev.technical_score}/100\n"
            f"- Communication Score: {ev.communication_score}/100\n"
            f"- Feedback: {ev.feedback}\n"
            f"- Missing Concepts: {missing}\n"
            f"- Needed Followup: {ev.needs_followup}"
        )
    eval_text = "\n\n".join(eval_summaries) if eval_summaries else "No evaluations recorded (Session concluded without answers)."

    # 2. Format Full Conversation Transcript
    transcript_lines = []
    for turn in full_transcript:
        sender = turn.get("role") or turn.get("sender") or "participant"
        content = turn.get("content") or turn.get("message") or ""
        transcript_lines.append(f"{sender.capitalize()}: {content}")
    transcript_text = "\n".join(transcript_lines) if transcript_lines else "No conversation turns recorded."

    user_prompt = f"""
Candidate Profile:
- Target Role: {context.role}
- Target Company: {context.company}
- Seniority Level: {context.difficulty}
- Stated Skills from Resume: {skills_formatted}

Turn-by-Turn Question Evaluations:
{eval_text}

Full Interview Conversation Transcript:
{transcript_text}

Synthesis Task:
1. Assess candidate's holistic performance across all dimensions.
2. Calculate overall_score matching aggregate technical proficiency.
3. List exactly 3 specific strengths and 3 actionable weaknesses.
4. Score all 6 Radar dimensions (Professionalism, Attitude, Creativity, Communication, Leadership, Teamwork) from 0-100.
5. Score all 4 Workmap competencies (Presentation, Opportunistic, Business Acumen, Closing Technique) from 0-100.
6. Provide an in-depth, actionable improvement roadmap in actionable_feedback.
""".strip()

    # Invoke LLM enforcing InterviewReport structured output schema
    report: InterviewReport = call_llm_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=InterviewReport,
    )

    return report
