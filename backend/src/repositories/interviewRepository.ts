import {
  dbManager,
  Interview,
  Question,
  InterviewAnswer,
  Evaluation,
  InterviewReport,
} from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export class InterviewRepository {
  async findById(id: string): Promise<Interview | null> {
    const item = dbManager.db.interviews.find((i) => i.id === id);
    return item || null;
  }

  async findByUserId(userId: string): Promise<Interview[]> {
    return dbManager.db.interviews
      .filter((i) => i.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async create(data: {
    user_id: string;
    company: string;
    role: string;
    difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
    type: 'Technical' | 'Behavioral' | 'System Design' | 'Custom';
    duration_minutes?: number;
  }): Promise<Interview> {
    const now = new Date().toISOString();
    const interview: Interview = {
      id: `int-${uuidv4().substring(0, 8)}`,
      user_id: data.user_id,
      company: data.company,
      role: data.role,
      difficulty: data.difficulty,
      type: data.type,
      status: 'PENDING',
      duration_minutes: data.duration_minutes || 30,
      current_question_index: 0,
      created_at: now,
      updated_at: now,
    };
    dbManager.db.interviews.push(interview);
    dbManager.save();
    return interview;
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    currentQuestionIndex?: number
  ): Promise<Interview | null> {
    const item = dbManager.db.interviews.find((i) => i.id === id);
    if (!item) return null;
    item.status = status;
    item.updated_at = new Date().toISOString();
    if (typeof currentQuestionIndex === 'number') {
      item.current_question_index = currentQuestionIndex;
    }
    dbManager.save();
    return item;
  }

  async addQuestions(
    interviewId: string,
    questions: Array<Omit<Question, 'id' | 'interview_id'>>
  ): Promise<Question[]> {
    const created: Question[] = [];
    questions.forEach((q, index) => {
      const newQ: Question = {
        id: `q-${uuidv4().substring(0, 8)}`,
        interview_id: interviewId,
        question_text: q.question_text,
        topic: q.topic || 'General',
        difficulty: q.difficulty || 'Mid-Level',
        order_index: q.order_index ?? index + 1,
        type: q.type || 'technical',
        starter_code: q.starter_code,
        ideal_answer: q.ideal_answer,
      };
      dbManager.db.questions.push(newQ);
      created.push(newQ);
    });
    dbManager.save();
    return created;
  }

  async getQuestions(interviewId: string): Promise<Question[]> {
    return dbManager.db.questions
      .filter((q) => q.interview_id === interviewId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  async saveAnswer(data: {
    interview_id: string;
    question_id: string;
    answer: string;
    score: number;
    feedback: string;
    follow_up_question?: string;
    code_submitted?: string;
  }): Promise<InterviewAnswer> {
    const answer: InterviewAnswer = {
      id: `ans-${uuidv4().substring(0, 8)}`,
      interview_id: data.interview_id,
      question_id: data.question_id,
      answer: data.answer,
      score: data.score,
      feedback: data.feedback,
      follow_up_question: data.follow_up_question,
      code_submitted: data.code_submitted,
      created_at: new Date().toISOString(),
    };
    dbManager.db.interview_answers.push(answer);
    dbManager.save();
    return answer;
  }

  async getAnswers(interviewId: string): Promise<InterviewAnswer[]> {
    return dbManager.db.interview_answers.filter((a) => a.interview_id === interviewId);
  }

  async saveEvaluation(data: Omit<Evaluation, 'id' | 'created_at'>): Promise<Evaluation> {
    // Remove previous if exists
    dbManager.db.evaluations = dbManager.db.evaluations.filter(
      (e) => e.interview_id !== data.interview_id
    );

    const evalRecord: Evaluation = {
      id: `eval-${uuidv4().substring(0, 8)}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    dbManager.db.evaluations.push(evalRecord);
    dbManager.save();
    return evalRecord;
  }

  async getEvaluation(interviewId: string): Promise<Evaluation | null> {
    return dbManager.db.evaluations.find((e) => e.interview_id === interviewId) || null;
  }

  async saveReport(data: Omit<InterviewReport, 'id' | 'created_at'>): Promise<InterviewReport> {
    // Remove previous if exists
    dbManager.db.interview_reports = dbManager.db.interview_reports.filter(
      (r) => r.interview_id !== data.interview_id
    );

    const report: InterviewReport = {
      id: `rep-${uuidv4().substring(0, 8)}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    dbManager.db.interview_reports.push(report);
    dbManager.save();
    return report;
  }

  async getReport(interviewId: string): Promise<InterviewReport | null> {
    return dbManager.db.interview_reports.find((r) => r.interview_id === interviewId) || null;
  }

  async getAnalyticsForUser(userId: string) {
    const userInterviews = dbManager.db.interviews.filter((i) => i.user_id === userId);
    const completed = userInterviews.filter((i) => i.status === 'COMPLETED');
    const interviewIds = completed.map((i) => i.id);

    const evaluations = dbManager.db.evaluations.filter((e) => interviewIds.includes(e.interview_id));

    const count = userInterviews.length;
    const completedCount = completed.length;

    if (evaluations.length === 0) {
      return {
        interviewsCount: count,
        completedCount: 0,
        averageScore: '0/10',
        accuracyRate: '0%',
        practiceTime: '0m',
        radarMetrics: [
          { subject: 'Professionalism', score: 0, fullMark: 100 },
          { subject: 'Attitude', score: 0, fullMark: 100 },
          { subject: 'Creativity', score: 0, fullMark: 100 },
          { subject: 'Communication', score: 0, fullMark: 100 },
          { subject: 'Leadership', score: 0, fullMark: 100 },
          { subject: 'Teamwork', score: 0, fullMark: 100 },
        ],
        workmapScores: {
          presentation: 0,
          opportunistic: 0,
          businessAcumen: 0,
          closingTechnique: 0,
        },
        recentInterviews: userInterviews.slice(0, 5),
      };
    }

    let totalScore = 0;
    let sumProf = 0;
    let sumAtt = 0;
    let sumCreat = 0;
    let sumComm = 0;
    let sumLead = 0;
    let sumTeam = 0;
    let sumPres = 0;
    let sumOpp = 0;
    let sumBus = 0;
    let sumClose = 0;

    evaluations.forEach((e) => {
      totalScore += (e.technical_score + e.communication_score) / 2;
      sumProf += e.radar_professionalism || 0;
      sumAtt += e.radar_attitude || 0;
      sumCreat += e.radar_creativity || 0;
      sumComm += e.radar_communication || 0;
      sumLead += e.radar_leadership || 0;
      sumTeam += e.radar_teamwork || 0;

      sumPres += e.workmap_presentation || 0;
      sumOpp += e.workmap_opportunistic || 0;
      sumBus += e.workmap_business_acumen || 0;
      sumClose += e.workmap_closing_technique || 0;
    });

    const N = evaluations.length;
    const avgScore = totalScore / N;
    const averageOutOf10 = (avgScore / 10).toFixed(1);
    const accuracyRate = Math.round(avgScore);

    const totalMinutes = completed.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const practiceTimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const radarMetrics = [
      { subject: 'Professionalism', score: Math.round(sumProf / N), fullMark: 100 },
      { subject: 'Attitude', score: Math.round(sumAtt / N), fullMark: 100 },
      { subject: 'Creativity', score: Math.round(sumCreat / N), fullMark: 100 },
      { subject: 'Communication', score: Math.round(sumComm / N), fullMark: 100 },
      { subject: 'Leadership', score: Math.round(sumLead / N), fullMark: 100 },
      { subject: 'Teamwork', score: Math.round(sumTeam / N), fullMark: 100 },
    ];

    const workmapScores = {
      presentation: Math.round(sumPres / N),
      opportunistic: Math.round(sumOpp / N),
      businessAcumen: Math.round(sumBus / N),
      closingTechnique: Math.round(sumClose / N),
    };

    return {
      interviewsCount: count,
      completedCount,
      averageScore: `${averageOutOf10}/10`,
      accuracyRate: `${accuracyRate}%`,
      practiceTime: practiceTimeFormatted,
      radarMetrics,
      workmapScores,
      recentInterviews: userInterviews.slice(0, 5),
    };
  }
}

export const interviewRepository = new InterviewRepository();

