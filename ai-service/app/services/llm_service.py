import os
import json
import random
from typing import List, Dict, Any
from app.schemas.schemas import (
    GenerateQuestionsRequest, QuestionItem,
    EvaluateAnswerRequest, EvaluateAnswerResponse, RadarAdjustments, WorkmapScores,
    GenerateReportRequest, GenerateReportResponse
)

class LLMService:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")

    def generate_questions(self, req: GenerateQuestionsRequest) -> List[QuestionItem]:
        # Domain tailored question bank
        role_lower = req.role.lower()
        company = req.company
        difficulty = req.difficulty
        int_type = req.type.lower()

        questions: List[QuestionItem] = []

        if "behavioral" in int_type:
            questions = [
                QuestionItem(
                    order_index=1,
                    question_text=f"Welcome! Could you share an experience at your previous company where you had to push back against a tight product deadline or technical compromise? What was the outcome?",
                    topic="Conflict Resolution & Integrity",
                    difficulty=difficulty,
                    type="behavioral",
                    ideal_answer="Demonstrate the STAR method (Situation, Task, Action, Result). State the technical risk with quantified data (e.g. data loss risk or 50% latency regression), propose a phased rollout or MVP scope reduction, align with stakeholders via an objective RFC, and deliver on time with high system stability."
                ),
                QuestionItem(
                    order_index=2,
                    question_text=f"At {company}, team collaboration and customer empathy are critical. Tell me about a time you led an initiative with ambiguous requirements and brought multiple stakeholders into alignment.",
                    topic="Leadership & Ambiguity",
                    difficulty=difficulty,
                    type="behavioral",
                    ideal_answer="Highlight proactive discovery: interviewing key users, writing clear product & technical requirement documents (PRD/TRD), breaking ambiguity into measurable milestones, establishing an iterative feedback loop, and unblocking cross-functional teams."
                ),
                QuestionItem(
                    order_index=3,
                    question_text=f"Describe a situation where a production incident occurred on code you or your team shipped. How did you triage, resolve, and conduct the post-mortem?",
                    topic="Ownership & Post-Incident Learning",
                    difficulty=difficulty,
                    type="behavioral",
                    ideal_answer="Walk through blameless post-mortem methodology: immediate mitigation (rollback or feature flag toggle) before root-cause analysis, clear stakeholder communication during incident, 5 Whys analysis, and actionable preventative items (e.g., automated canary tests, enhanced telemetry, synthetic alerts)."
                ),
            ]
        elif "system" in int_type or "design" in int_type:
            questions = [
                QuestionItem(
                    order_index=1,
                    question_text=f"How would you design a globally distributed real-time notification engine for {company} that can deliver 100M push messages per hour with at-least-once delivery semantics?",
                    topic="Distributed Pub/Sub & Queues",
                    difficulty=difficulty,
                    type="system_design",
                    ideal_answer="Design utilizing partitioned Apache Kafka topics or AWS SQS with distributed consumer workers, Redis cluster for deduplication caching (idempotency key TTL), Cassandra/DynamoDB for append-only delivery receipts, and backpressure mechanisms with dead-letter queues (DLQ) for failed device tokens."
                ),
                QuestionItem(
                    order_index=2,
                    question_text=f"Walk me through your database sharding and partitioning strategy when scaling user activity feeds beyond a single relational database instance.",
                    topic="Database Sharding & Replication",
                    difficulty=difficulty,
                    type="system_design",
                    ideal_answer="Use consistent hashing on user_id with virtual nodes to avoid rebalancing hotspots. Implement read replicas for feed queries, separate hot feeds into Redis sorted sets, and use fan-out-on-write for standard users with fan-out-on-read for high-follower celebrity accounts."
                ),
                QuestionItem(
                    order_index=3,
                    question_text=f"How do you address cache stampedes, hot partition keys, and cache-aside invalidation in a multi-region Redis deployment at {company}?",
                    topic="Caching & High Availability",
                    difficulty=difficulty,
                    type="system_design",
                    ideal_answer="Prevent stampedes with Probabilistic Early Expiration (XFetch algorithm) or distributed mutex locks. Distribute hot keys via random salt suffixes. Invalidate via event-driven CDC (Change Data Capture) over Kafka, and leverage Redis Active-Active multi-region replication."
                ),
            ]
        else: # Technical
            questions = [
                QuestionItem(
                    order_index=1,
                    question_text=f"In building high-performance modern web platforms for {company}, how do you manage state synchronization, WebSocket reconnect backoffs, and optimistic UI updates?",
                    topic="Client-Server State Sync",
                    difficulty=difficulty,
                    type="technical",
                    ideal_answer="1. State Sync: Event-driven client cache (TanStack Query/normalized store) with monotonic version IDs for conflict resolution. 2. WebSockets: Exponential backoff with full randomized jitter (e.g. 500ms doubling to 10s ceiling with ±20% jitter) to eliminate thundering herd connection spikes. 3. Optimistic UI: Apply mutation immediately to local cache with temporary ID and snapshot rollback buffer; reconcile upon canonical server ack."
                ),
                QuestionItem(
                    order_index=2,
                    question_text=f"Given an array of incoming HTTP requests with timestamps and IP addresses, write an algorithm to determine if an IP has exceeded a rate limit of 10 requests per 10-second window.",
                    topic="Algorithms & Concurrency",
                    difficulty=difficulty,
                    type="coding",
                    starter_code="// Sliding Window Rate Limiter\nfunction isRateLimited(requests, windowSeconds = 10, maxLimit = 10) {\n  // Implement sliding window algorithm\n  return false;\n}",
                    ideal_answer="Sliding Window Log algorithm: For each IP, maintain a deque of timestamps. On request arrival at T, prune timestamps older than (T - 10,000ms). If queue length >= 10, reject with HTTP 429 and Retry-After header; otherwise append T and allow. In distributed production, execute atomically in Redis using a Sorted Set (ZREMRANGEBYSCORE + ZADD + ZCARD) wrapped in an EVAL Lua script to eliminate race conditions."
                ),
                QuestionItem(
                    order_index=3,
                    question_text=f"Explain how the Node.js event loop coordinates timers, I/O polling, and microtasks, and how unhandled Promise rejections affect application stability in production.",
                    topic="Event Loop & Concurrency",
                    difficulty=difficulty,
                    type="technical",
                    ideal_answer="Event loop runs phases: Timers -> Pending callbacks -> Poll (I/O) -> Check (setImmediate) -> Close callbacks. Microtasks (process.nextTick, Promise .then) run immediately between phase transitions with priority. Unhandled Promise rejections trigger unhandledRejection events and terminate the Node process in modern versions, potentially leaking connection pool resources and crashing pods."
                ),
            ]

        return questions[:req.count]

    def evaluate_answer(self, req: EvaluateAnswerRequest) -> EvaluateAnswerResponse:
        import re
        answer_text = req.answer.strip().lower()
        ideal_text = (req.ideal_answer or "").strip().lower()
        word_count = len(answer_text.split())

        # 1. Detection of evasion, refusal, or "I don't know" / nonsense
        evasion_phrases = [
            "don't know", "dont know", "do not know", "no idea", "not sure",
            "skip", "pass", "idk", "no answer", "nothing", "wrong",
            "cant answer", "can't answer", "random", "blah", "test", "dunno"
        ]
        is_evasion = any(phrase in answer_text for phrase in evasion_phrases) and word_count < 15
        is_empty = word_count < 3

        if is_empty or is_evasion:
            score = round(random.uniform(5.0, 12.0), 1)
            feedback = (
                "Incorrect / Evasive. You did not provide a valid technical solution for this question. "
                "In a real technical interview, state your foundational reasoning or clarify assumptions rather than skipping."
            )
            radar = RadarAdjustments(
                professionalism=round(score + 10.0, 1),
                attitude=round(score + 8.0, 1),
                creativity=round(score + 5.0, 1),
                communication=round(score + 5.0, 1),
                leadership=round(score + 2.0, 1),
                teamwork=round(score + 5.0, 1)
            )
            workmap = WorkmapScores(
                presentation=round(score + 5.0, 1),
                opportunistic=round(score + 2.0, 1),
                businessAcumen=round(score + 5.0, 1),
                closingTechnique=round(score + 2.0, 1)
            )
            return EvaluateAnswerResponse(
                score=score,
                feedback=feedback,
                follow_up_question="Could you share any prior experience you have with this concept, even at a high level?",
                radar_adjustments=radar,
                workmap_scores=workmap
            )

        # 2. Extract technical keywords from ideal_answer
        stop_words = {
            "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with",
            "by", "about", "of", "from", "as", "is", "are", "was", "were", "be",
            "been", "being", "have", "has", "had", "do", "does", "did", "this",
            "that", "these", "those", "it", "its", "you", "your", "we", "our",
            "they", "their", "will", "would", "should", "could", "can", "may",
            "might", "must", "than", "then", "into", "through", "during", "such",
            "all", "any", "both", "each", "few", "more", "most", "other", "some",
            "no", "nor", "not", "only", "own", "same", "so", "very",
            "ideal", "answer", "question", "exemplary", "benchmark", "senior-level",
            "solution", "candidate", "approach", "structure", "system", "using"
        }

        ideal_words = set(re.findall(r'[a-zA-Z0-9_\-\+]+', ideal_text))
        technical_ideal_terms = {w for w in ideal_words if len(w) > 3 and w not in stop_words}

        candidate_words = set(re.findall(r'[a-zA-Z0-9_\-\+]+', answer_text))
        matched_terms = candidate_words.intersection(technical_ideal_terms)

        if technical_ideal_terms:
            concept_coverage = len(matched_terms) / len(technical_ideal_terms)
        else:
            concept_coverage = 0.5

        # Optional code submission check
        code_bonus = 0.0
        if req.code_submitted and len(req.code_submitted.strip()) > 40:
            code_text = req.code_submitted.strip().lower()
            if "return false" in code_text and "map" not in code_text and "deque" not in code_text and "window" not in code_text:
                code_bonus = 0.0
            else:
                code_bonus = 10.0

        # Comparative evaluation against ideal answer
        if concept_coverage < 0.10:
            # Completely wrong / off-topic
            raw_score = 8.0 + (concept_coverage * 100) + code_bonus
            raw_score = min(25.0, max(5.0, raw_score))
            missing_preview = ', '.join(list(technical_ideal_terms)[:4]) if technical_ideal_terms else "required architectural concepts"
            feedback = (
                f"Incorrect response. Your answer did not address the required technical solution. "
                f"You missed essential components such as: {missing_preview}."
            )
        elif concept_coverage < 0.25:
            # Flawed / superficial attempt
            raw_score = 25.0 + (concept_coverage * 80) + code_bonus
            raw_score = min(48.0, max(26.0, raw_score))
            missing_preview = ', '.join(list(technical_ideal_terms - matched_terms)[:4])
            feedback = (
                f"Partially relevant but incomplete. You mentioned general points, but failed to explain key mechanics "
                f"like: {missing_preview}."
            )
        elif concept_coverage < 0.50:
            # Moderate foundation, missing edge cases/trade-offs
            raw_score = 50.0 + (concept_coverage * 50) + code_bonus
            raw_score = min(76.0, max(50.0, raw_score))
            missing_preview = ', '.join(list(technical_ideal_terms - matched_terms)[:3])
            matched_preview = ', '.join(list(matched_terms)[:3])
            feedback = (
                f"Good conceptual foundation. You covered {matched_preview}, but to reach senior level depth, "
                f"address edge cases and trade-offs regarding: {missing_preview}."
            )
        else:
            # Strong alignment with ideal answer
            raw_score = 78.0 + (concept_coverage * 20) + code_bonus
            raw_score = min(96.0, max(78.0, raw_score))
            feedback = (
                f"Outstanding technical accuracy! Your answer directly matches the expected model solution, "
                f"demonstrating sound understanding of production trade-offs and best practices."
            )

        score = round(raw_score, 1)

        # Scale Radar & Workmap proportional to actual score
        radar = RadarAdjustments(
            professionalism=min(96.0, max(15.0, round(score + 2.0, 1))),
            attitude=min(94.0, max(15.0, round(score + 1.0, 1))),
            creativity=min(92.0, max(10.0, round(score - 2.0, 1))),
            communication=min(95.0, max(10.0, round(score, 1))),
            leadership=min(90.0, max(10.0, round(score - 4.0, 1))),
            teamwork=min(93.0, max(12.0, round(score - 1.0, 1)))
        )

        workmap = WorkmapScores(
            presentation=min(95.0, max(15.0, round(score + 3.0, 1))),
            opportunistic=min(85.0, max(10.0, round(score - 8.0, 1))),
            businessAcumen=min(90.0, max(10.0, round(score - 2.0, 1))),
            closingTechnique=min(80.0, max(10.0, round(score - 10.0, 1)))
        )

        follow_ups = [
            f"How would this architecture behave if network latency between services spikes to 500ms at {req.company}?",
            "What monitoring metrics and alerts would you establish to detect degradation in this component?",
            "Could you explain the memory complexity trade-off if we increased the throughput requirement by 10x?"
        ]
        chosen_follow_up = random.choice(follow_ups)

        return EvaluateAnswerResponse(
            score=score,
            feedback=feedback,
            follow_up_question=chosen_follow_up,
            radar_adjustments=radar,
            workmap_scores=workmap
        )

    def generate_report(self, req: GenerateReportRequest) -> GenerateReportResponse:
        if not req.answers:
            return GenerateReportResponse(
                overall_score=0.0,
                technical_score=0.0,
                communication_score=0.0,
                strengths=["No answers were submitted to evaluate."],
                weaknesses=["All questions in this session were left unanswered or skipped."],
                recommendations=["Activate your microphone and speak your answers aloud for each question to generate evaluation scores."],
                detailed_summary="The candidate concluded this interview session without speaking or submitting any answers. No evaluation score can be awarded.",
                radar=RadarAdjustments(
                    professionalism=0.0,
                    attitude=0.0,
                    creativity=0.0,
                    communication=0.0,
                    leadership=0.0,
                    teamwork=0.0
                ),
                workmap=WorkmapScores(
                    presentation=0.0,
                    opportunistic=0.0,
                    businessAcumen=0.0,
                    closingTechnique=0.0
                )
            )

        scores = [a.score for a in req.answers]
        avg_score = round(sum(scores) / len(scores), 1)

        tech_score = min(98.0, round(avg_score + 1.0, 1))
        comm_score = min(95.0, round(avg_score - 1.0, 1))

        strengths = [
            f"Demonstrated technical reasoning on questions answered for {req.company}.",
            "Methodical articulation during live interview responses.",
            "Active attempt to address core architectural challenges."
        ]

        weaknesses = [
            "Could state operational trade-offs and edge cases more explicitly.",
            "Ensure all questions are fully answered with quantitative justifications."
        ]

        recommendations = [
            "Structure system design answers starting with functional requirements and back-of-the-envelope calculations.",
            f"Familiarize yourself with {req.company}'s engineering blog and open-source distributed systems.",
            "Practice speaking technical answers aloud under timed conditions."
        ]

        summary = (
            f"Candidate completed {len(req.answers)} answered question(s) for {req.role} ({req.difficulty} level). "
            f"Achieved an overall score of {avg_score}% based strictly on candidate submissions."
        )

        radar = RadarAdjustments(
            professionalism=min(95.0, round(avg_score + 2.0, 1)),
            attitude=min(93.0, round(avg_score + 1.0, 1)),
            creativity=min(90.0, round(avg_score - 2.0, 1)),
            communication=min(94.0, round(avg_score, 1)),
            leadership=min(88.0, round(avg_score - 4.0, 1)),
            teamwork=min(92.0, round(avg_score - 1.0, 1))
        )

        workmap = WorkmapScores(
            presentation=min(95.0, round(avg_score + 3.0, 1)),
            opportunistic=min(85.0, round(avg_score - 12.0, 1)),
            businessAcumen=min(90.0, round(avg_score - 2.0, 1)),
            closingTechnique=min(80.0, round(avg_score - 15.0, 1))
        )

        return GenerateReportResponse(
            overall_score=avg_score,
            technical_score=tech_score,
            communication_score=comm_score,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            detailed_summary=summary,
            radar=radar,
            workmap=workmap
        )

llm_service = LLMService()

