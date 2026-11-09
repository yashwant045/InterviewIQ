import { interviewRepository } from '../repositories/interviewRepository';
import { resumeRepository } from '../repositories/resumeRepository';
import { userRepository } from '../repositories/userRepository';
import { aiBridgeService } from './aiBridgeService';
import { jobQueue } from '../queues/jobQueue';

export class InterviewService {
  async createInterview(userId: string, data: {
    company: string;
    role: string;
    difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
    type: 'Technical' | 'Behavioral' | 'System Design' | 'Custom';
    duration_minutes?: number;
  }) {
    const interview = await interviewRepository.create({
      user_id: userId,
      company: data.company,
      role: data.role,
      difficulty: data.difficulty,
      type: data.type,
      duration_minutes: data.duration_minutes || 30,
    });
    return interview;
  }

  async getUserInterviews(userId: string) {
    return interviewRepository.findByUserId(userId);
  }

  async getInterviewDetails(interviewId: string) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      throw new Error('Interview not found.');
    }
    const questions = await interviewRepository.getQuestions(interviewId);
    const answers = await interviewRepository.getAnswers(interviewId);
    const evaluation = await interviewRepository.getEvaluation(interviewId);
    const report = await interviewRepository.getReport(interviewId);

    return {
      interview,
      questions,
      answers,
      evaluation,
      report,
    };
  }

  async startInterview(interviewId: string, userId: string) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      throw new Error('Interview not found.');
    }

    // Check if questions already generated
    let questions = await interviewRepository.getQuestions(interviewId);
    if (questions.length === 0) {
      // Gather user skills & resume
      const profileData = await userRepository.getProfile(userId);
      const skills = profileData.skills.map((s) => s.skill_name);
      const latestResume = await resumeRepository.findByUserId(userId);

      const generated = await aiBridgeService.generateQuestions({
        role: interview.role,
        company: interview.company,
        difficulty: interview.difficulty,
        type: interview.type,
        skills,
        resumeText: latestResume ? latestResume.extracted_text : undefined,
        count: 3,
      });

      questions = await interviewRepository.addQuestions(interviewId, generated);
    }

    await interviewRepository.updateStatus(interviewId, 'IN_PROGRESS', 0);

    const firstQuestion = questions[0] || null;

    return {
      message: 'Interview session started',
      interview: {
        ...interview,
        status: 'IN_PROGRESS',
        current_question_index: 0,
      },
      currentQuestion: firstQuestion,
      totalQuestions: questions.length,
    };
  }

  async submitAnswer(interviewId: string, userId: string, data: {
    question_id: string;
    answer: string;
    code_submitted?: string;
  }) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      throw new Error('Interview not found.');
    }

    const questions = await interviewRepository.getQuestions(interviewId);
    const currentQuestion = questions.find((q) => q.id === data.question_id);
    if (!currentQuestion) {
      throw new Error('Question not found in this interview session.');
    }

    // AI answer evaluation
    const evaluationResult = await aiBridgeService.evaluateAnswer({
      role: interview.role,
      company: interview.company,
      difficulty: interview.difficulty,
      question_text: currentQuestion.question_text,
      answer: data.answer,
      code_submitted: data.code_submitted,
    });

    // Save answer
    const savedAnswer = await interviewRepository.saveAnswer({
      interview_id: interviewId,
      question_id: data.question_id,
      answer: data.answer,
      score: evaluationResult.score,
      feedback: evaluationResult.feedback,
      follow_up_question: evaluationResult.follow_up_question,
      code_submitted: data.code_submitted,
    });

    // Determine next question
    const currentIndex = questions.findIndex((q) => q.id === data.question_id);
    const nextIndex = currentIndex + 1;
    const isCompleted = nextIndex >= questions.length;

    const nextQuestion = !isCompleted ? questions[nextIndex] : null;

    if (isCompleted) {
      await interviewRepository.updateStatus(interviewId, 'COMPLETED', nextIndex);
      // Queue async report generation
      await jobQueue.addJob('generate_report_async', { interviewId, userId });
      // Generate final report immediately
      await this.generateReport(interviewId);
    } else {
      await interviewRepository.updateStatus(interviewId, 'IN_PROGRESS', nextIndex);
    }

    return {
      answer: savedAnswer,
      evaluation: evaluationResult,
      isCompleted,
      nextQuestion,
      nextQuestionIndex: nextIndex,
      totalQuestions: questions.length,
    };
  }

  async generateReport(interviewId: string) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      throw new Error('Interview not found.');
    }

    const questions = await interviewRepository.getQuestions(interviewId);
    const answers = await interviewRepository.getAnswers(interviewId);

    const questionAnswerPairs = answers.map((a) => {
      const q = questions.find((item) => item.id === a.question_id);
      return {
        question: q ? q.question_text : 'Question',
        answer: a.answer,
        score: a.score,
      };
    });

    const reportData = await aiBridgeService.generateFinalReport({
      role: interview.role,
      company: interview.company,
      difficulty: interview.difficulty,
      answers: questionAnswerPairs,
    });

    const savedEvaluation = await interviewRepository.saveEvaluation({
      interview_id: interviewId,
      technical_score: reportData.technical_score,
      communication_score: reportData.communication_score,
      workmap_presentation: reportData.workmap.presentation,
      workmap_opportunistic: reportData.workmap.opportunistic,
      workmap_business_acumen: reportData.workmap.businessAcumen,
      workmap_closing_technique: reportData.workmap.closingTechnique,
      radar_professionalism: reportData.radar.professionalism,
      radar_attitude: reportData.radar.attitude,
      radar_creativity: reportData.radar.creativity,
      radar_communication: reportData.radar.communication,
      radar_leadership: reportData.radar.leadership,
      radar_teamwork: reportData.radar.teamwork,
      feedback: reportData.detailed_summary,
    });

    const savedReport = await interviewRepository.saveReport({
      interview_id: interviewId,
      overall_score: reportData.overall_score,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      detailed_summary: reportData.detailed_summary,
    });

    return {
      report: savedReport,
      evaluation: savedEvaluation,
    };
  }

  async getReport(interviewId: string) {
    let report = await interviewRepository.getReport(interviewId);
    let evaluation = await interviewRepository.getEvaluation(interviewId);
    const answers = await interviewRepository.getAnswers(interviewId);

    if (!report || (answers.length === 0 && (report.overall_score > 0 || (evaluation && evaluation.technical_score > 0)))) {
      const generated = await this.generateReport(interviewId);
      report = generated.report;
      evaluation = generated.evaluation;
    }

    const interview = await interviewRepository.findById(interviewId);
    const questions = await interviewRepository.getQuestions(interviewId);

    return {
      interview,
      report,
      evaluation,
      questions,
      answers,
    };
  }

  async getDashboardAnalytics(userId: string) {
    return interviewRepository.getAnalyticsForUser(userId);
  }
}

export const interviewService = new InterviewService();

