import axios from 'axios';
import { ENV } from '../config/env';

export interface GenerateQuestionsParams {
  role: string;
  company: string;
  difficulty: string;
  type: string;
  skills: string[];
  resumeText?: string;
  count?: number;
}

export interface GeneratedQuestion {
  question_text: string;
  topic: string;
  difficulty: string;
  order_index: number;
  type: 'technical' | 'behavioral' | 'system_design' | 'coding';
  starter_code?: string;
  ideal_answer?: string;
}

export interface EvaluateAnswerParams {
  role: string;
  company: string;
  question_text: string;
  answer: string;
  code_submitted?: string;
  difficulty: string;
  ideal_answer?: string;
}

export interface AnswerEvaluationResult {
  score: number; // 0-100
  feedback: string;
  follow_up_question?: string;
  radar_adjustments: {
    professionalism: number;
    attitude: number;
    creativity: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  workmap_scores: {
    presentation: number;
    opportunistic: number;
    businessAcumen: number;
    closingTechnique: number;
  };
}

export interface GenerateReportParams {
  role: string;
  company: string;
  difficulty: string;
  answers: Array<{ question: string; answer: string; score: number }>;
}

export interface ReportResult {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailed_summary: string;
  technical_score: number;
  communication_score: number;
  radar: {
    professionalism: number;
    attitude: number;
    creativity: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  workmap: {
    presentation: number;
    opportunistic: number;
    businessAcumen: number;
    closingTechnique: number;
  };
}

export class AIBridgeService {
  private client = axios.create({
    baseURL: ENV.AI_SERVICE_URL,
    timeout: 7000,
  });

  async generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
    try {
      const response = await this.client.post('/api/ai/generate-questions', params);
      if (response.data && response.data.questions && response.data.questions.length > 0) {
        return response.data.questions;
      }
    } catch (err: any) {
      console.warn('[AIBridgeService] Python AI Service unavailable, using internal AI Engine:', err.message);
    }
    return this.internalFallbackGenerateQuestions(params);
  }

  async generateResumeQuestion(params: {
    role: string;
    company: string;
    difficulty: string;
    skills: string[];
    resume_text?: string;
  }): Promise<GeneratedQuestion> {
    try {
      const response = await this.client.post('/api/ai/resume-question', {
        role: params.role,
        company: params.company,
        difficulty: params.difficulty,
        parsed_resume_skills: params.skills,
        resume_text: params.resume_text,
      });
      if (response.data && response.data.question_text) {
        return {
          order_index: 1,
          question_text: response.data.question_text,
          topic: response.data.topic || 'Resume Deep Dive',
          difficulty: params.difficulty,
          type: response.data.requires_code ? 'coding' : 'technical',
          starter_code: response.data.starter_code,
          ideal_answer: response.data.expected_ideal_answer,
        };
      }
    } catch (err: any) {
      console.warn('[AIBridgeService] Resume question endpoint unavailable, using internal fallback:', err.message);
    }
    return {
      order_index: 1,
      question_text: `I see on your resume that you built key initiatives for ${params.role}. Can you walk me through your most complex architectural decision, the trade-offs you evaluated, and how you handled peak production traffic?`,
      topic: 'Resume Deep Dive',
      difficulty: params.difficulty,
      type: 'technical',
      ideal_answer: 'Candidate should clearly explain the problem statement, system architecture, technology selection trade-offs, and measurable production impact.',
    };
  }

  async evaluateAnswer(params: EvaluateAnswerParams): Promise<AnswerEvaluationResult> {
    try {
      const response = await this.client.post('/api/ai/evaluate-answer', params);
      if (response.data && typeof response.data.score === 'number') {
        return response.data;
      }
    } catch (err: any) {
      console.warn('[AIBridgeService] Python AI Service unavailable, using internal Evaluation Engine:', err.message);
    }
    return this.internalFallbackEvaluateAnswer(params);
  }

  async generateFinalReport(params: GenerateReportParams): Promise<ReportResult> {
    try {
      const response = await this.client.post('/api/ai/generate-report', params);
      if (response.data && response.data.overall_score) {
        return response.data;
      }
    } catch (err: any) {
      console.warn('[AIBridgeService] Python AI Service unavailable, using internal Report Engine:', err.message);
    }
    return this.internalFallbackGenerateReport(params);
  }

  // Realistic intelligent fallback question bank customized to target company and role
  private internalFallbackGenerateQuestions(params: GenerateQuestionsParams): GeneratedQuestion[] {
    const { role, company, difficulty, type } = params;

    if (type === 'Behavioral') {
      return [
        {
          order_index: 1,
          question_text: `Tell me about a challenging situation at work where you had a disagreement with a team member or stakeholder regarding a technical decision. How did you resolve it?`,
          topic: 'Conflict Resolution & Collaboration',
          difficulty,
          type: 'behavioral',
          ideal_answer: `An ideal STAR-method response:
• Situation: Working on a critical microservices migration with a tight timeline where a peer argued for MongoDB while I advocated for PostgreSQL with JSONB columns.
• Task: Align the engineering team on a unified data storage strategy without causing project delays or interpersonal friction.
• Action: Led an objective, data-driven spike comparing both solutions against query patterns, ACID requirements, and developer velocity. Facilitated an open RFC architecture review where trade-offs were documented collaboratively.
• Result: Reached consensus on PostgreSQL with JSONB, which delivered 99.99% reliability, prevented schema drift, and met our launch deadline with zero production rollbacks.`,
        },
        {
          order_index: 2,
          question_text: `Describe a project where requirements changed significantly mid-way or you faced tight deadlines at ${company}. How did you prioritize deliverables?`,
          topic: 'Adaptability & Prioritization',
          difficulty,
          type: 'behavioral',
          ideal_answer: `An ideal response demonstrates structured trade-off evaluation and stakeholder management:
• Situation: Two weeks before a major release, executive leadership requested an unexpected compliance and auditing requirement.
• Task: Incorporate audit logging without postponing the agreed GA delivery date.
• Action: Conducted a rapid MoSCoW prioritization session with Product and Engineering managers. Decoupled non-blocking nice-to-have UI animations to post-v1, while designing an asynchronous audit log stream using existing Kafka topics to satisfy compliance without re-architecting core business logic.
• Result: Shipped the MVP on time with 100% compliance audit coverage, followed by phased incremental improvements.`,
        },
        {
          order_index: 3,
          question_text: `Give me an example of a time you received constructive feedback on your code or design. What action did you take to improve?`,
          topic: 'Continuous Learning & Growth Mindset',
          difficulty,
          type: 'behavioral',
          ideal_answer: `An exemplary response demonstrating humility and engineering excellence:
• Situation: In a senior peer review for a payment processing service, a Staff Engineer pointed out that my retry logic lacked exponential backoff with jitter and could induce a thundering herd on upstream banking APIs.
• Task: Accept the constructive feedback, rectify the implementation immediately, and systematically prevent similar gaps.
• Action: Thanked the reviewer, studied distributed retry literature (e.g. AWS Exponential Backoff with Decorrelated Jitter), and implemented the recommended pattern with comprehensive unit/integration test coverage.
• Result: Created a reusable resilience utility module adopted across 4 other backend services and authored an engineering guild guide on fault-tolerant networking.`,
        },
      ];
    }

    if (type === 'System Design') {
      return [
        {
          order_index: 1,
          question_text: `Design a high-throughput, low-latency URL shortening service (like bit.ly) or distributed notification system for ${company} that handles 50,000 requests per second.`,
          topic: 'Scalability & Storage Sharding',
          difficulty,
          type: 'system_design',
          ideal_answer: `Exemplary System Design Blueprint:
1. Requirements & Scale: 50k read RPS, 5k write RPS. 10:1 read-to-write ratio. Low latency (<10ms read), high availability (99.99%).
2. ID Generation: Use Base62 encoding (A-Z, a-z, 0-9) yielding 62^7 = ~3.5 trillion unique 7-character URLs. Generated via distributed ID service (Snowflake or pre-allocated range coordination in Zookeeper/Redis) to avoid collisions without DB locks.
3. Storage: NoSQL Key-Value Store (Cassandra or DynamoDB) partitioned on 'hash_key' for horizontal sharding. Secondary relational store for user metadata.
4. Caching & CDN: Multi-tier caching using Redis cluster (LRU eviction policy) storing top 20% hot URLs, satisfying 80% read volume from memory with <2ms latency. Global CDN edge routing for geographic distribution.
5. High Availability: Active-Active multi-region replication with eventual consistency for writes and read replicas with health check failovers.`,
        },
        {
          order_index: 2,
          question_text: `How would you architect a distributed caching layer with cache invalidation, cache stampede prevention, and high availability across multi-region clusters?`,
          topic: 'Caching & Consistency Trade-offs',
          difficulty,
          type: 'system_design',
          ideal_answer: `Key Architectural Principles:
1. Cache Stampede Mitigation: Implement Probabilistic Early Expiration (XFetch algorithm) or Distributed Mutex/Locks (Redlock) so only a single background worker regenerates expired hot keys while others continue reading slightly stale cache.
2. Invalidation Strategy: Combine Cache-Aside (Lazy Loading) for reads with Write-Through or Event-Driven Invalidation via CDC (Change Data Capture using Debezium/Kafka) to invalidate specific cache keys immediately on DB mutations.
3. Multi-Region Replication: Deploy Redis Enterprise or AWS ElastiCache Global Datastore with asynchronous replication across regions. Use local reads in each region and route mutations to the primary region.
4. Fault Tolerance: Consistent hashing with virtual nodes to distribute traffic evenly across cache instances; circuit breaker patterns (e.g., Resilience4j) to prevent cascading database crashes if cache instances experience network partition.`,
        },
        {
          order_index: 3,
          question_text: `How would you handle eventual consistency vs strong consistency when designing a distributed transactional ledger or payment pipeline for ${company}?`,
          topic: 'Distributed Transactions & Consensus',
          difficulty,
          type: 'system_design',
          ideal_answer: `Production Payment Architecture:
1. Consistency Model: Strong consistency for ledger balances and double-entry bookkeeping; eventual consistency for analytics, notifications, and merchant reporting.
2. Dual-Write Problem Solution: Implement the Transactional Outbox Pattern. Within a single local DB transaction, write the payment status and append an outbox event. A reliable CDC worker publishes the event to Apache Kafka with guaranteed at-least-once delivery.
3. Distributed Transactions (Saga Pattern): Utilize Orchestration-based Saga with temporal workflows rather than 2PC (Two-Phase Commit) to avoid long-lived blocking locks. Each step (authorize, reserve funds, debit, confirm) has an explicit compensating transaction for rollbacks.
4. Idempotency: Enforce client-supplied idempotency keys (UUIDv4) stored with unique DB constraints and TTL in Redis to prevent duplicate charges on network retries.`,
        },
      ];
    }

    // Default Technical
    return [
      {
        order_index: 1,
        question_text: `As a ${role} at ${company}, how do you design and structure RESTful APIs and real-time WebSocket communication for predictable scalability and fault-tolerance?`,
        topic: 'Architecture & Real-Time APIs',
        difficulty,
        type: 'technical',
        ideal_answer: `Benchmark Senior-Level Answer:
1. RESTful Architecture: Structure APIs following Richardson Maturity Level 3 with consistent resource URI hierarchies, strict HTTP verbs, semantic status codes, JSON:API/OpenAPI 3.0 contracts, and cursor-based pagination (using opaque base64 tokens rather than offset/limit).
2. WebSocket Scalability: Decouple socket connections from application workers using a distributed Redis Pub/Sub or Socket.IO Redis Adapter cluster behind sticky load balancers. This allows horizontal scaling of gateway nodes while broadcasting events across instances.
3. Reconnect & Resilience: Implement exponential backoff with randomized jitter (e.g., base delay 500ms doubling to 10s ceiling with ±20% jitter) on clients to eliminate thundering herd spikes during reconnects. Pair with heartbeat pings/pongs to terminate ghost connections.
4. Optimistic State & Buffering: Maintain an offline IndexedDB buffer with monotonic sequence IDs on the client; sync upon reconnect with server-side idempotency verification.`,
      },
      {
        order_index: 2,
        question_text: `Implement an efficient algorithm to detect duplicate transactions in a sliding 60-second window, or explain how you optimize high-frequency data structures in memory.`,
        topic: 'Data Structures & Algorithms',
        difficulty,
        type: 'coding',
        starter_code: `// Implement sliding window deduplication\nclass TransactionDeduplicator {\n  constructor(windowSeconds = 60) {\n    this.windowSeconds = windowSeconds;\n  }\n\n  isDuplicate(transactionId, timestamp) {\n    // Write your solution here\n    return false;\n  }\n}`,
        ideal_answer: `Algorithmic Solution & Production Scale:
1. Single-Node In-Memory (Sliding Window Log):
Maintain a Map where key is transaction signature/ID and value is a double-ended queue (deque) of millisecond timestamps.
When isDuplicate(id, t) is invoked:
- Prune all timestamps older than (t - 60,000ms).
- If the remaining queue contains the same timestamp/payload hash, return true (duplicate).
- Otherwise append t and return false.
Amortized time complexity: O(1) per check; Space complexity: O(N) bounded by active transactions in the 60s window.

2. Distributed High-Throughput (Redis Atomic Lua Script):
In multi-server clusters at ${company}, implement via Redis Sorted Sets (ZSET):
- ZREMRANGEBYSCORE txn_key -inf (t - 60000)
- ZSCORE txn_key txn_hash -> if exists, duplicate detected.
- If not exists: ZADD txn_key t txn_hash and EXPIRE txn_key 60
Wrap commands inside an EVAL Lua script to execute atomically without concurrency race conditions.`,
      },
      {
        order_index: 3,
        question_text: `How do you diagnose and resolve memory leaks and performance bottlenecks in asynchronous Node.js event loops and frontend React component re-renders?`,
        topic: 'Debugging & Performance Profiling',
        difficulty,
        type: 'technical',
        ideal_answer: `Comprehensive Diagnostic Methodology:
1. Node.js Event Loop & Memory Profiling:
- Diagnostics: Capture V8 heap snapshots via Chrome DevTools (--inspect) or clinic.js (clinic doctor / clinic flame). Compare heap diffs between baseline and under-load states to locate lingering closures, uncollected event listener subscriptions (emitter.on without emitter.off), or unbounded global cache maps.
- Event Loop Lag: Monitor libuv loop delay via perf_hooks (monitorEventLoopDelay) to detect synchronous CPU-blocking operations (JSON.parse of huge payloads, synchronous regex catastrophic backtracking) and offload CPU-intensive tasks to Worker Threads or BullMQ workers.

2. React Re-render Optimization:
- Diagnostics: Profile using React DevTools Profiler (record 'Why did this component render?') and Chrome Performance tracing.
- Remediation: Isolate frequently mutating state from heavy tree components, utilize stable function and object references via useMemo/useCallback where dependencies are expensive, leverage React.memo for pure leaf components, virtualize long lists (react-window/virtualizer), and adopt fine-grained reactivity stores (e.g. Zustand with selectors or TanStack Query) to prevent top-level context provider waterfalls.`,
      },
    ];
  }

  private internalFallbackEvaluateAnswer(params: EvaluateAnswerParams): AnswerEvaluationResult {
    const answerText = (params.answer || '').trim().toLowerCase();
    const idealText = (params.ideal_answer || '').trim().toLowerCase();
    const words = answerText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Evasion / Refusal / Nonsense check
    const evasionPhrases = [
      "don't know", "dont know", "do not know", "no idea", "not sure",
      "skip", "pass", "idk", "no answer", "nothing", "wrong",
      "cant answer", "can't answer", "random", "blah", "test", "dunno"
    ];
    const isEvasion = evasionPhrases.some((p) => answerText.includes(p)) && wordCount < 15;
    const isEmpty = wordCount < 3;

    if (isEmpty || isEvasion) {
      const score = 8;
      return {
        score,
        feedback:
          'Incorrect / Evasive. You did not provide a valid technical solution. In a real technical interview, state your foundational reasoning or clarify assumptions rather than skipping.',
        follow_up_question: 'Could you share your thought process or any high-level intuition on this topic?',
        radar_adjustments: {
          professionalism: 15,
          attitude: 15,
          creativity: 10,
          communication: 10,
          leadership: 10,
          teamwork: 12,
        },
        workmap_scores: {
          presentation: 15,
          opportunistic: 10,
          businessAcumen: 12,
          closingTechnique: 10,
        },
      };
    }

    // 2. Keyword & Concept Overlap with ideal_answer
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'about', 'of', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'this', 'that', 'these',
      'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their', 'will',
      'would', 'should', 'could', 'can', 'than', 'into', 'ideal', 'answer',
      'solution', 'candidate', 'approach', 'structure', 'using'
    ]);

    const idealTerms = new Set(
      idealText.match(/[a-zA-Z0-9_\-\+]+/g)?.filter((w) => w.length > 3 && !stopWords.has(w)) || []
    );

    const candidateTerms = new Set(
      answerText.match(/[a-zA-Z0-9_\-\+]+/g)?.filter((w) => w.length > 3 && !stopWords.has(w)) || []
    );

    let matchCount = 0;
    const matchedTerms: string[] = [];
    candidateTerms.forEach((term) => {
      if (idealTerms.has(term)) {
        matchCount++;
        matchedTerms.push(term);
      }
    });

    const totalIdeal = Math.max(1, idealTerms.size);
    const coverage = matchCount / totalIdeal;

    let score = 10;
    let feedback = '';

    if (coverage < 0.10) {
      // Completely wrong / off-topic
      score = Math.min(25, Math.max(8, Math.round(10 + coverage * 100)));
      const missing = Array.from(idealTerms).slice(0, 4).join(', ');
      feedback = `Incorrect response. Your answer did not address the required technical concepts. You missed essential components such as: ${missing || 'core architecture principles'}.`;
    } else if (coverage < 0.25) {
      score = Math.min(48, Math.max(26, Math.round(25 + coverage * 80)));
      const missing = Array.from(idealTerms).filter((t) => !candidateTerms.has(t)).slice(0, 3).join(', ');
      feedback = `Partially recognized the domain but missing critical architecture. You missed: ${missing}.`;
    } else if (coverage < 0.50) {
      score = Math.min(76, Math.max(50, Math.round(50 + coverage * 50)));
      const missing = Array.from(idealTerms).filter((t) => !candidateTerms.has(t)).slice(0, 3).join(', ');
      feedback = `Good conceptual foundation. You covered ${matchedTerms.slice(0, 3).join(', ')}, but omitted edge cases and trade-offs regarding ${missing}.`;
    } else {
      score = Math.min(96, Math.max(78, Math.round(75 + coverage * 20)));
      feedback = `Outstanding technical accuracy! Your response accurately aligns with the expected model solution and demonstrates senior-level technical depth.`;
    }

    return {
      score,
      feedback,
      follow_up_question: `Could you elaborate on the operational and memory trade-offs of that approach under high load?`,
      radar_adjustments: {
        professionalism: Math.min(95, Math.max(12, score + 2)),
        attitude: Math.min(94, Math.max(12, score + 1)),
        creativity: Math.min(92, Math.max(10, score - 2)),
        communication: Math.min(95, Math.max(10, score)),
        leadership: Math.min(90, Math.max(10, score - 4)),
        teamwork: Math.min(93, Math.max(12, score - 1)),
      },
      workmap_scores: {
        presentation: Math.min(95, Math.max(12, score + 3)),
        opportunistic: Math.min(85, Math.max(10, score - 8)),
        businessAcumen: Math.min(90, Math.max(10, score - 2)),
        closingTechnique: Math.min(80, Math.max(10, score - 10)),
      },
    };
  }

  private internalFallbackGenerateReport(params: GenerateReportParams): ReportResult {
    if (!params.answers || params.answers.length === 0) {
      return {
        overall_score: 0,
        technical_score: 0,
        communication_score: 0,
        strengths: ['No answers were submitted to evaluate.'],
        weaknesses: ['All questions in this session were left unanswered or skipped.'],
        recommendations: ['Activate your microphone and speak your answers aloud for each question to generate evaluation scores.'],
        detailed_summary: 'The candidate concluded this interview session without speaking or submitting any answers. No evaluation score can be awarded.',
        radar: {
          professionalism: 0,
          attitude: 0,
          creativity: 0,
          communication: 0,
          leadership: 0,
          teamwork: 0,
        },
        workmap: {
          presentation: 0,
          opportunistic: 0,
          businessAcumen: 0,
          closingTechnique: 0,
        },
      };
    }

    const scores = params.answers.map((a) => a.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return {
      overall_score: avg,
      technical_score: Math.min(98, avg + 2),
      communication_score: Math.min(95, avg - 1),
      strengths: [
        `High architectural awareness on questions answered for ${params.role}.`,
        `Demonstrated proactive attitude toward edge cases and performance profiling.`,
        `Comfortable communicating technical trade-offs.`,
      ],
      weaknesses: [
        `Ensure all questions in the session are fully answered.`,
        `Opportunity to tie technical outcomes more directly to business metrics and user-facing SLAs.`,
      ],
      recommendations: [
        `Practice the STAR method (Situation, Task, Action, Result) for behavioral questions to keep answers concise.`,
        `When discussing distributed architectures at ${params.company}, quantify operational costs and cache hit-ratios.`,
        `Review automated end-to-end testing strategies and zero-downtime blue/green deployment workflows.`,
      ],
      detailed_summary: `Candidate completed ${params.answers.length} answered question(s) for ${params.role} at ${params.company}. With an overall score of ${avg}%, they exhibited technical clarity and communication.`,
      radar: {
        professionalism: Math.min(95, avg + 2),
        attitude: Math.min(92, avg + 1),
        creativity: Math.min(90, avg - 2),
        communication: Math.min(94, avg),
        leadership: Math.min(88, avg - 4),
        teamwork: Math.min(92, avg - 1),
      },
      workmap: {
        presentation: Math.min(95, avg + 3),
        opportunistic: Math.min(85, avg - 12),
        businessAcumen: Math.min(90, avg - 2),
        closingTechnique: Math.min(80, avg - 15),
      },
    };
  }
}

export const aiBridgeService = new AIBridgeService();

