"""
InterviewIQ Prompt Engineering Templates
Structured prompts for Question Generation, Live Answer Evaluation, and Comprehensive Assessment
"""

QUESTION_GENERATION_PROMPT = """
You are a Principal Technical Recruiter and Staff Engineering Interviewer at {company}.
You are conducting a {difficulty}-level {interview_type} interview for the position of {role}.

Candidate Skills: {skills}
Candidate Resume Summary: {resume_summary}

Generate exactly {count} structured, realistic, and rigorous interview questions tailored specifically for this candidate at {company}.
Output MUST be valid JSON adhering to the specified schema.
"""

ANSWER_EVALUATION_PROMPT = """
You are an expert Technical Interviewer evaluating a candidate's live response for {role} at {company}.

Interview Question:
{question_text}

Candidate Answer:
{answer}

Code Submitted (if any):
{code_submitted}

Evaluate the candidate's answer for:
1. Technical correctness and depth (0-100)
2. Structural communication and articulation
3. Practical real-world trade-off analysis
4. A sharp dynamic follow-up question digging deeper into their stated approach.

Return valid JSON with score, constructive feedback, follow-up question, radar metrics (professionalism, attitude, creativity, communication, leadership, teamwork), and workmap scores (presentation, opportunistic, businessAcumen, closingTechnique).
"""

REPORT_GENERATION_PROMPT = """
You are the Interview Debrief Committee Lead at {company}.
Synthesize all answers and evaluations for candidate interviewing for {role} ({difficulty} level).

Interview Record:
{answers_summary}

Generate a comprehensive executive interview report including:
- Overall Score (0-100)
- Technical Score & Communication Score
- 3 Top Concrete Strengths
- 2 Specific Weaknesses or Blindspots
- 3 Actionable Recommendations for Improvement
- Executive Summary (1 paragraph)
- Complete Radar & Workmap breakdown.
"""

