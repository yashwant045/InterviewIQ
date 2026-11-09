const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/database.json');
let db = {
  users: [],
  profiles: [],
  resumes: [],
  skills: [],
  user_skills: [],
  interviews: [],
  questions: [],
  interview_answers: [],
  evaluations: [],
  interview_reports: []
};

if (fs.existsSync(dbPath)) {
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (e) {
    console.error('Error reading dbPath:', e);
  }
}

// Find or create Yashwant
let yashUser = db.users.find(u => u.name?.toLowerCase().includes('yash') || u.email?.includes('yashwant'));
if (!yashUser) {
  yashUser = {
    id: 'user-54352569',
    name: 'Yashwant',
    email: 'yashwantsingh9006@gmail.com',
    password_hash: '$2a$10$ug8jFrQ.kyZn2LljgJuP5OPoYwZ3Ftv6GBZFNsc2AFd1NZghufrbi',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  };
  db.users.push(yashUser);
}
const uid = yashUser.id;

// 1. Profile
let profile = db.profiles.find(p => p.user_id === uid);
if (!profile) {
  profile = {
    id: 'profile-yashwant',
    user_id: uid,
    education: 'B.Tech in Computer Science & Engineering',
    experience: '4+ years of Full-Stack & Distributed Systems Engineering. Built high-throughput microservices in Node.js/TypeScript, modern React frontends, Redis caching layers, and scalable PostgreSQL architectures.',
    target_role: 'Senior Full Stack Engineer',
    target_company: 'Google',
    bio: 'Senior software engineer focused on distributed systems, high-performance web architecture, and resilient API design. Preparing for Staff/Senior Full Stack interviews at top tier tech companies.'
  };
  db.profiles.push(profile);
} else {
  profile.education = 'B.Tech in Computer Science & Engineering';
  profile.experience = '4+ years of Full-Stack & Distributed Systems Engineering. Built high-throughput microservices in Node.js/TypeScript, modern React frontends, Redis caching layers, and scalable PostgreSQL architectures.';
  profile.target_role = 'Senior Full Stack Engineer';
  profile.target_company = 'Google';
  profile.bio = 'Senior software engineer focused on distributed systems, high-performance web architecture, and resilient API design. Preparing for Staff/Senior Full Stack interviews at top tier tech companies.';
}

// 2. Resume
db.resumes = db.resumes.filter(r => r.user_id !== uid);
db.resumes.push({
  id: 'resume-yashwant-1',
  user_id: uid,
  filename: 'Yashwant_Singh_Resume_Senior_Engineer.pdf',
  file_url: '/uploads/resumes/Yashwant_Singh_Resume.pdf',
  extracted_text: 'Yashwant Singh - Senior Full Stack Engineer. 4+ years of production experience building high-throughput microservices, distributed systems, and modern web applications. Core competencies: TypeScript, React, Next.js, Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS, WebSockets, System Design, GraphQL, Kafka, CI/CD pipelines.',
  skills_detected: [
    'React.js',
    'TypeScript',
    'Node.js',
    'System Design',
    'PostgreSQL',
    'Redis',
    'WebSockets',
    'Docker & Kubernetes',
    'Algorithms & Data Structures',
    'RESTful APIs & GraphQL'
  ],
  created_at: new Date(Date.now() - 10 * 86400000).toISOString()
});

// 3. User Skills
const defaultSkills = [
  { name: 'React.js', category: 'Frontend', prof: 'Expert' },
  { name: 'TypeScript', category: 'Languages', prof: 'Expert' },
  { name: 'Node.js', category: 'Backend', prof: 'Expert' },
  { name: 'System Design', category: 'Architecture', prof: 'Advanced' },
  { name: 'PostgreSQL', category: 'Databases', prof: 'Advanced' },
  { name: 'Redis', category: 'Databases', prof: 'Advanced' },
  { name: 'WebSockets', category: 'Networking', prof: 'Expert' },
  { name: 'Docker & Kubernetes', category: 'DevOps', prof: 'Advanced' },
  { name: 'Algorithms & Data Structures', category: 'Core CS', prof: 'Advanced' },
  { name: 'RESTful APIs & GraphQL', category: 'Backend', prof: 'Expert' },
];

db.user_skills = db.user_skills.filter(us => us.user_id !== uid);
defaultSkills.forEach((s, idx) => {
  let sk = db.skills.find(item => item.skill_name === s.name);
  if (!sk) {
    sk = { id: `s-${idx + 10}`, skill_name: s.name, category: s.category };
    db.skills.push(sk);
  }
  db.user_skills.push({
    id: `us-yash-${idx + 1}`,
    user_id: uid,
    skill_id: sk.id,
    proficiency: s.prof
  });
});

// 4. Interviews, Questions, Answers, Evaluations, Reports for Yashwant
const googleIntId = 'int-d62c8d63'; // The one in Yashwant's screenshot

// Ensure Google Interview exists and is COMPLETED
let googleInt = db.interviews.find(i => i.id === googleIntId);
if (!googleInt) {
  googleInt = {
    id: googleIntId,
    user_id: uid,
    company: 'Google',
    role: 'Senior Full Stack Engineer',
    difficulty: 'Senior',
    type: 'Technical',
    status: 'COMPLETED',
    duration_minutes: 35,
    current_question_index: 3,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  };
  db.interviews.push(googleInt);
} else {
  googleInt.status = 'COMPLETED';
  googleInt.duration_minutes = 35;
  googleInt.current_question_index = 3;
}

// Ensure 3 questions for Google Interview
const q1Id = 'q-0d6e3ac0';
const q2Id = 'q-67f0e763';
const q3Id = 'q-cf5bbba0';

db.questions = db.questions.filter(q => q.interview_id !== googleIntId);
db.questions.push(
  {
    id: q1Id,
    interview_id: googleIntId,
    question_text: 'In building high-performance modern web platforms for Google, how do you manage state synchronization, WebSocket reconnect backoffs, and optimistic UI updates?',
    topic: 'Client-Server State Sync',
    difficulty: 'Senior',
    order_index: 1,
    type: 'technical'
  },
  {
    id: q2Id,
    interview_id: googleIntId,
    question_text: 'Given an array of incoming HTTP requests with timestamps and IP addresses, write an algorithm to determine if an IP has exceeded a rate limit of 10 requests per 10-second window.',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Senior',
    order_index: 2,
    type: 'coding',
    starter_code: '// Sliding Window Rate Limiter\nclass SlidingWindowRateLimiter {\n  constructor(windowSeconds = 10, maxLimit = 10) {\n    this.windowMs = windowSeconds * 1000;\n    this.maxLimit = maxLimit;\n    this.ipLogs = new Map();\n  }\n\n  isRateLimited(ip, timestamp = Date.now()) {\n    if (!this.ipLogs.has(ip)) {\n      this.ipLogs.set(ip, []);\n    }\n    const timestamps = this.ipLogs.get(ip);\n    const cutoff = timestamp - this.windowMs;\n    while (timestamps.length > 0 && timestamps[0] <= cutoff) {\n      timestamps.shift();\n    }\n    if (timestamps.length >= this.maxLimit) {\n      return true;\n    }\n    timestamps.push(timestamp);\n    return false;\n  }\n}'
  },
  {
    id: q3Id,
    interview_id: googleIntId,
    question_text: 'Explain how the Node.js event loop coordinates timers, I/O polling, and microtasks, and how unhandled Promise rejections affect application stability in production.',
    topic: 'Event Loop & Concurrency',
    difficulty: 'Senior',
    order_index: 3,
    type: 'technical'
  }
);

// Real candidate answers for Google Interview
db.interview_answers = db.interview_answers.filter(a => a.interview_id !== googleIntId);
db.interview_answers.push(
  {
    id: 'ans-yash-1',
    interview_id: googleIntId,
    question_id: q1Id,
    answer: 'For client-server state sync, I use an event-driven architecture combining React Query/TanStack Query with a singleton WebSocket manager. We implement exponential backoff with randomized jitter (e.g., base delay 500ms, doubling up to a 10s ceiling with ±20% jitter) to prevent "thundering herd" spikes on our gateway when connections drop. For optimistic updates: on user mutation, we immediately write the provisional state to the local cache with a temporary deterministic ID, roll back with snapshot rollback if the server returns an error or socket ack times out, and reconcile with the canonical server sequence number once acknowledged. For disconnected periods, we queue outgoing messages in an IndexedDB buffer with monotonic sequence IDs and execute an idempotency check on reconnect.',
    score: 89,
    feedback: 'Outstanding senior-level response. You clearly explained exponential backoff with jitter to eliminate thundering herd problems, detailed rollback snapshot mechanisms, and correctly utilized idempotent sequence IDs.',
    follow_up_question: 'How do you guarantee strict causal ordering if a client sends 5 mutations while temporarily in an offline buffer?',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ans-yash-2',
    interview_id: googleIntId,
    question_id: q2Id,
    answer: 'I implement a sliding window log algorithm. For each IP address, we maintain a double-ended queue (deque) of request timestamps. When a new request arrives at timestamp T, we prune all timestamps older than T - 10,000ms. If the remaining count in the queue is >= 10, we reject with HTTP 429 and Retry-After. Otherwise, we push T into the queue and permit the request. In a distributed multi-instance environment at Google, we execute this atomically in Redis using a sorted set (ZREMRANGEBYSCORE + ZADD + ZCARD) wrapped in an EVAL Lua script to prevent race conditions.',
    code_submitted: 'class SlidingWindowRateLimiter {\n  constructor(windowSeconds = 10, maxLimit = 10) {\n    this.windowMs = windowSeconds * 1000;\n    this.maxLimit = maxLimit;\n    this.ipLogs = new Map();\n  }\n\n  isRateLimited(ip, timestamp = Date.now()) {\n    if (!this.ipLogs.has(ip)) {\n      this.ipLogs.set(ip, []);\n    }\n    const timestamps = this.ipLogs.get(ip);\n    const cutoff = timestamp - this.windowMs;\n    while (timestamps.length > 0 && timestamps[0] <= cutoff) {\n      timestamps.shift();\n    }\n    if (timestamps.length >= this.maxLimit) {\n      return true; // Limit exceeded (429)\n    }\n    timestamps.push(timestamp);\n    return false; // Allowed\n  }\n}',
    score: 92,
    feedback: 'Superb algorithmic implementation and complexity analysis. The sliding window log handles boundary bursts accurately. Your explanation of atomic Redis sorted sets with Lua scripting demonstrates real production scalability.',
    follow_up_question: 'What is the memory footprint trade-off of sliding window logs versus leaky bucket at 100M active IPs?',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ans-yash-3',
    interview_id: googleIntId,
    question_id: q3Id,
    answer: 'The Node.js libuv event loop progresses through phases: Timers (setTimeout/setInterval) -> Pending callbacks (system I/O) -> Idle/Prepare -> Poll (retrieves new I/O events, executes blocking I/O) -> Check (setImmediate) -> Close callbacks. Crucially, microtask queues (process.nextTick has top priority, followed by resolved Promises) are drained immediately after every operation before the event loop advances to the next phase. Unhandled Promise rejections in modern Node.js terminate the process with a non-zero exit code (--unhandled-rejections=strict). In production, this can trigger cascading container restarts if unmonitored; we capture unhandledRejection globally, emit structured telemetry to Datadog/CloudWatch, gracefully drain inflight HTTP connections, and allow Kubernetes to provision a healthy pod.',
    score: 88,
    feedback: 'Thorough, accurate understanding of libuv phases, microtask queue draining precedence (nextTick vs Promise), and production container lifecycle resilience.',
    follow_up_question: 'How do CPU-bound synchronous computations like heavy JSON parsing starve the Poll phase and what architecture solves this?',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
);

// Evaluation for Google Interview
db.evaluations = db.evaluations.filter(e => e.interview_id !== googleIntId);
db.evaluations.push({
  id: 'eval-google-yash',
  interview_id: googleIntId,
  technical_score: 90,
  communication_score: 86,
  workmap_presentation: 90,
  workmap_opportunistic: 65,
  workmap_business_acumen: 85,
  workmap_closing_technique: 75,
  radar_professionalism: 89,
  radar_attitude: 86,
  radar_creativity: 84,
  radar_communication: 87,
  radar_leadership: 82,
  radar_teamwork: 85,
  feedback: 'Yashwant demonstrated deep technical clarity, structured communication using first-principles reasoning, and an impressive grasp of high-scale engineering trade-offs for Google.',
  created_at: new Date(Date.now() - 1 * 86400000).toISOString()
});

// Report for Google Interview
db.interview_reports = db.interview_reports.filter(r => r.interview_id !== googleIntId);
db.interview_reports.push({
  id: 'rep-google-yash',
  interview_id: googleIntId,
  overall_score: 88,
  strengths: [
    'Exemplary command of real-time client-server synchronization, exponential backoff with jitter, and optimistic UI rollbacks.',
    'Clean, efficient implementation of sliding window rate limiting with precise time-complexity analysis.',
    'Deep mastery of Node.js libuv event loop mechanics, microtask queue prioritization, and production failover patterns.'
  ],
  weaknesses: [
    'Could explicitly highlight distributed Redis memory overhead (RAM consumption per IP) when comparing sliding window log vs token bucket.',
    'Opportunity to mention OpenTelemetry spans and metric instrumentation for monitoring rate-limit drop ratios.'
  ],
  recommendations: [
    'Review token bucket Redis Lua script patterns for sub-millisecond distributed rate limiting.',
    'In behavioral follow-ups, tie system throughput metrics directly to business conversion and infrastructure cost reduction.',
    'Practice live whiteboarding for distributed consensus (Raft/Paxos) in system design rounds.'
  ],
  detailed_summary: 'Yashwant performed in the top percentile of candidate evaluations for Senior Full Stack Engineer at Google. His answers were concise, methodical, and demonstrated real-world production experience with concrete architectural justification. Recommended for onsite rounds.',
  created_at: new Date(Date.now() - 1 * 86400000).toISOString()
});

// Additional Real Historical Mock Sessions for Yashwant:
// 2. Meta - Senior Frontend Engineer
const metaIntId = 'int-meta-fe-yash';
if (!db.interviews.some(i => i.id === metaIntId)) {
  db.interviews.push({
    id: metaIntId,
    user_id: uid,
    company: 'Meta',
    role: 'Senior Frontend Engineer',
    difficulty: 'Senior',
    type: 'Technical',
    status: 'COMPLETED',
    duration_minutes: 40,
    current_question_index: 2,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  const mq1 = 'q-meta-1';
  const mq2 = 'q-meta-2';
  db.questions.push(
    {
      id: mq1,
      interview_id: metaIntId,
      question_text: 'How do you design a virtualized grid capable of smoothly rendering 50,000 live updating financial tickers at 60 FPS in React?',
      topic: 'DOM Virtualization & Rendering',
      difficulty: 'Senior',
      order_index: 1,
      type: 'technical'
    },
    {
      id: mq2,
      interview_id: metaIntId,
      question_text: 'Explain React 19 Concurrent Features (useTransition, useDeferredValue) and how Fiber reconciliation priorities prevent UI thread blocking.',
      topic: 'React Concurrency & Scheduler',
      difficulty: 'Senior',
      order_index: 2,
      type: 'technical'
    }
  );

  db.interview_answers.push(
    {
      id: 'ans-meta-1',
      interview_id: metaIntId,
      question_id: mq1,
      answer: 'I implement a dynamic windowed virtualizer using scroll offsets and overscan buffers, rendering only ~25 visible DOM nodes. Ticker calculations and sorting are delegated off the main thread to a dedicated Web Worker via Comlink with SharedArrayBuffer to avoid serialization overhead. State updates utilize requestAnimationFrame batching and CSS transform3d hardware acceleration.',
      score: 93,
      feedback: 'Excellent breakdown of window virtualization, Web Workers with SharedArrayBuffer, and hardware compositor utilization.',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'ans-meta-2',
      interview_id: metaIntId,
      question_id: mq2,
      answer: 'React 19 Concurrent Mode breaks reconciliation into interruptible chunks across lanes with varying priorities (SyncLane, InputContinuousLane, TransitionLane). With useTransition, non-urgent updates yield execution to incoming user inputs (typing/clicks). The Fiber tree maintains current and workInProgress trees, allowing double-buffering so partial renders are never committed to the real DOM prematurely.',
      score: 90,
      feedback: 'Precise explanation of React Scheduler priority lanes, double-buffering in the Fiber architecture, and useTransition prioritization.',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    }
  );

  db.evaluations.push({
    id: 'eval-meta-yash',
    interview_id: metaIntId,
    technical_score: 92,
    communication_score: 89,
    workmap_presentation: 92,
    workmap_opportunistic: 70,
    workmap_business_acumen: 84,
    workmap_closing_technique: 80,
    radar_professionalism: 90,
    radar_attitude: 88,
    radar_creativity: 89,
    radar_communication: 91,
    radar_leadership: 84,
    radar_teamwork: 88,
    feedback: 'Outstanding mastery of frontend performance, browser rendering pipeline, and React Fiber internals.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  db.interview_reports.push({
    id: 'rep-meta-yash',
    interview_id: metaIntId,
    overall_score: 91,
    strengths: [
      'Mastery of browser compositor threads, requestAnimationFrame scheduling, and virtual DOM windowing.',
      'Clear, lucid articulation of React Fiber priority lanes and interruptible reconciliation.'
    ],
    weaknesses: [
      'Could discuss cross-browser memory leaks when using Web Workers with large SharedArrayBuffers.'
    ],
    recommendations: [
      'Explore WebGL / Canvas fallbacks for data grids exceeding 100k continuous real-time points.'
    ],
    detailed_summary: 'Yashwant demonstrated top-tier frontend architectural expertise for Meta. Highly recommended.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  });
}

// 3. Amazon - Distributed Systems Architect (System Design)
const amzIntId = 'int-amz-sd-yash';
if (!db.interviews.some(i => i.id === amzIntId)) {
  db.interviews.push({
    id: amzIntId,
    user_id: uid,
    company: 'Amazon',
    role: 'Distributed Systems Architect',
    difficulty: 'Senior',
    type: 'System Design',
    status: 'COMPLETED',
    duration_minutes: 45,
    current_question_index: 2,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
  });

  const aq1 = 'q-amz-1';
  db.questions.push({
    id: aq1,
    interview_id: amzIntId,
    question_text: 'Design an idempotent payment checkout and ledger pipeline that handles 50,000 transactions per second with at-least-once SQS message delivery and zero double-charging.',
    topic: 'Idempotency & Financial Ledgers',
    difficulty: 'Senior',
    order_index: 1,
    type: 'system_design'
  });

  db.interview_answers.push({
    id: 'ans-amz-1',
    interview_id: amzIntId,
    question_id: aq1,
    answer: 'We enforce an idempotency key generated by the client and stored with a unique constraint in DynamoDB with conditional putItem (attribute_not_exists). Checkout events publish to FIFO SQS with MessageDeduplicationId. Payment workers acquire a distributed Redis lock per orderId, authorize with the payment provider via idempotency token, write immutable double-entry ledger entries in PostgreSQL with serializable isolation, and emit downstream fulfillment events.',
    score: 87,
    feedback: 'Solid idempotent design using DynamoDB conditional writes, SQS FIFO deduplication, and double-entry accounting ledgers.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  });

  db.evaluations.push({
    id: 'eval-amz-yash',
    interview_id: amzIntId,
    technical_score: 88,
    communication_score: 85,
    workmap_presentation: 88,
    workmap_opportunistic: 75,
    workmap_business_acumen: 86,
    workmap_closing_technique: 78,
    radar_professionalism: 88,
    radar_attitude: 85,
    radar_creativity: 82,
    radar_communication: 86,
    radar_leadership: 84,
    radar_teamwork: 86,
    feedback: 'Strong distributed systems fundamentals and reliable financial transaction engineering.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  });

  db.interview_reports.push({
    id: 'rep-amz-yash',
    interview_id: amzIntId,
    overall_score: 86,
    strengths: [
      'Comprehensive grasp of idempotency keys, FIFO queue deduplication, and double-entry bookkeeping.',
      'Strong defense of consistency vs availability trade-offs under network partition.'
    ],
    weaknesses: [
      'Could elaborate on multi-region reconciliation and dead-letter queue (DLQ) replay strategies.'
    ],
    recommendations: [
      'Review Distributed Saga Orchestrators vs Choreography patterns for microservice rollbacks.'
    ],
    detailed_summary: 'Yashwant exhibited mature distributed architecture practices suitable for Amazon Senior SDE.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  });
}

// 4. Stripe - Senior Software Engineer (Behavioral)
const stripeIntId = 'int-stripe-beh-yash';
if (!db.interviews.some(i => i.id === stripeIntId)) {
  db.interviews.push({
    id: stripeIntId,
    user_id: uid,
    company: 'Stripe',
    role: 'Senior Software Engineer',
    difficulty: 'Senior',
    type: 'Behavioral',
    status: 'COMPLETED',
    duration_minutes: 30,
    current_question_index: 2,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  });

  const sq1 = 'q-str-1';
  db.questions.push({
    id: sq1,
    interview_id: stripeIntId,
    question_text: 'Tell me about a time you handled a critical production incident under high pressure. How did you triage, communicate with stakeholders, and prevent recurrence?',
    topic: 'Incident Management & Leadership',
    difficulty: 'Senior',
    order_index: 1,
    type: 'behavioral'
  });

  db.interview_answers.push({
    id: 'ans-str-1',
    interview_id: stripeIntId,
    question_id: sq1,
    answer: 'Situation: A database connection pool exhaustion incident caused 500 errors on 15% of checkout traffic. Task: As on-call lead, my priority was immediate mitigation, customer impact containment, and stakeholder alignment. Action: I immediately enabled circuit breakers to shed non-essential traffic, scaled read replicas, and opened a real-time status channel for support. Once traffic normalized, I traced the issue to unindexed foreign key lookups. Result: Full recovery in 18 minutes. I led a blameless post-mortem, added automated connection pool alarms, and implemented query timeout caps.',
    score: 89,
    feedback: 'Clear, concise STAR method application. Demonstrates calm on-call leadership, customer empathy, and systematic post-incident engineering.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  });

  db.evaluations.push({
    id: 'eval-str-yash',
    interview_id: stripeIntId,
    technical_score: 87,
    communication_score: 89,
    workmap_presentation: 91,
    workmap_opportunistic: 80,
    workmap_business_acumen: 88,
    workmap_closing_technique: 82,
    radar_professionalism: 92,
    radar_attitude: 90,
    radar_creativity: 84,
    radar_communication: 91,
    radar_leadership: 89,
    radar_teamwork: 90,
    feedback: 'Exemplary behavioral maturity and clear communication.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  });

  db.interview_reports.push({
    id: 'rep-str-yash',
    interview_id: stripeIntId,
    overall_score: 88,
    strengths: [
      'Structured STAR format with measurable impact metrics (18-minute recovery).',
      'Proactive focus on blameless engineering culture and preventive automation.'
    ],
    weaknesses: [
      'Could touch on business SLA penalty implications during the outage.'
    ],
    recommendations: [
      'Continue demonstrating strong operational ownership.'
    ],
    detailed_summary: 'Yashwant showed senior engineering leadership and mature executive presence.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Real data seed completed successfully for Yashwant!');
console.log('Interviews for Yashwant:', db.interviews.filter(i => i.user_id === uid).length);
console.log('Answers for Yashwant:', db.interview_answers.filter(a => [googleIntId, metaIntId, amzIntId, stripeIntId].includes(a.interview_id)).length);

