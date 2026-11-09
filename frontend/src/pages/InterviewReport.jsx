import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import RadarScore from '../components/RadarScore';
import WorkmapBars from '../components/WorkmapBars';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  Mic,
  BookOpen,
} from 'lucide-react';

export default function InterviewReport() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const result = await interviewService.getReport(interviewId);
        setData(result);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Synthesizing comprehensive interview report in real-time...</p>
      </div>
    );
  }

  const report = data?.report;
  const evaluation = data?.evaluation;
  const interview = data?.interview;
  const questions = data?.questions || [];
  const answers = data?.answers || [];

  const overallScore = answers.length > 0 ? (report?.overall_score ?? Math.round(answers.reduce((acc, a) => acc + a.score, 0) / answers.length)) : 0;
  const technicalScore = answers.length > 0 ? (evaluation?.technical_score ? Math.round(evaluation.technical_score) : overallScore) : 0;
  const communicationScore = answers.length > 0 ? (evaluation?.communication_score ? Math.round(evaluation.communication_score) : overallScore) : 0;

  const radarData = answers.length > 0 ? {
    professionalism: evaluation?.radar_professionalism ?? 0,
    attitude: evaluation?.radar_attitude ?? 0,
    creativity: evaluation?.radar_creativity ?? 0,
    communication: evaluation?.radar_communication ?? 0,
    leadership: evaluation?.radar_leadership ?? 0,
    teamwork: evaluation?.radar_teamwork ?? 0,
  } : {
    professionalism: 0,
    attitude: 0,
    creativity: 0,
    communication: 0,
    leadership: 0,
    teamwork: 0,
  };

  const workmapData = answers.length > 0 ? {
    presentation: evaluation?.workmap_presentation ?? 0,
    opportunistic: evaluation?.workmap_opportunistic ?? 0,
    businessAcumen: evaluation?.workmap_business_acumen ?? 0,
    closingTechnique: evaluation?.workmap_closing_technique ?? 0,
  } : {
    presentation: 0,
    opportunistic: 0,
    businessAcumen: 0,
    closingTechnique: 0,
  };

  const strengths = answers.length > 0 ? (report?.strengths || []) : ['No answers were submitted during this session.'];
  const weaknesses = answers.length > 0 ? (report?.weaknesses || []) : ['All questions were skipped or unanswered.'];
  const recommendations = answers.length > 0 ? (report?.recommendations || []) : ['Speak your answers aloud into the microphone to receive live AI scoring.'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Evaluation Debrief</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {interview?.role || 'Interview'} Report
            </h1>
            <p className="text-slate-400 text-xs">
              Target Company: <span className="text-purple-400 font-semibold">{interview?.company || 'Company'}</span> • Track: {interview?.type || 'Technical'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => navigate('/configure')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another</span>
          </button>
        </div>
      </div>

      {/* Top Score Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-violet-950/60 to-[#121522] border border-violet-500/40 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">Overall Score</span>
            <div className="text-4xl font-extrabold text-white">{overallScore}%</div>
            <span className="text-xs text-emerald-400 font-medium">
              {overallScore >= 75 ? 'Qualified for Advanced Rounds' : 'Foundational Practice Required'}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-purple-600/20 text-purple-400">
            <Award className="w-10 h-10" />
          </div>
        </div>

        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Technical Depth</span>
            <div className="text-4xl font-extrabold text-white">
              {technicalScore}%
            </div>
            <span className="text-xs text-slate-400">Architecture & logic execution</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
            TECH
          </div>
        </div>

        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Communication & STAR</span>
            <div className="text-4xl font-extrabold text-white">
              {communicationScore}%
            </div>
            <span className="text-xs text-slate-400">Articulation & structure</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
            COMM
          </div>
        </div>
      </div>

      {/* Radar & Workmap Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">AI Video Performance Radar</h3>
            <span className="text-xs text-purple-400 font-medium">6 Evaluated Dimensions</span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-axis assessment evaluating verbal delivery, professionalism, attitude, creativity, and leadership.
          </p>
          <RadarScore scores={radarData} size={300} />
        </div>

        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Workmap Execution Competencies</h3>
            <span className="text-xs text-amber-400 font-medium">Behavioral Mapping</span>
          </div>
          <p className="text-xs text-slate-400">
            Workplace behavioral indicators measuring your presentation impact, opportunistic problem solving, and closing clarity.
          </p>
          <div className="pt-4">
            <WorkmapBars scores={workmapData} />
          </div>
        </div>
      </div>

      {/* Detailed Insights: Strengths, Weaknesses, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-[#121522] border border-emerald-500/30 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Key Strengths</span>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2.5 text-xs text-slate-300">
              {strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Detailed strengths will populate upon completing questions.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-[#121522] border border-amber-500/30 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Identified Growth Areas</span>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-2.5 text-xs text-slate-300">
              {weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No weaknesses identified for this session.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-[#121522] border border-purple-500/30 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Lightbulb className="w-5 h-5" />
            <span>Actionable Next Steps</span>
          </div>
          {recommendations.length > 0 ? (
            <ul className="space-y-2.5 text-xs text-slate-300">
              {recommendations.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Complete more sessions to generate personalized recommendations.</p>
          )}
        </div>
      </div>

      {/* Answer-by-Answer Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">Question & Answer Log</h3>
        {questions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#121522] rounded-2xl border border-slate-800">
            No question logs recorded for this interview session.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const answer = answers.find((a) => a.question_id === q.id);
              return (
                <div
                  key={q.id}
                  className="bg-[#121522] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-400">
                      Question {idx + 1} • {q.topic}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      Score: {answer ? `${answer.score}%` : '0% (Unanswered)'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-relaxed">{q.question_text}</h4>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    {/* 1. Candidate's Spoken Answer */}
                    {answer ? (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-purple-400" />
                            Your Spoken Answer:
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Recorded via microphone
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-3 text-xs text-slate-500 italic">
                        No spoken answer recorded for this question (skipped or unanswered).
                      </div>
                    )}

                    {/* Code Submitted (if any) */}
                    {answer?.code_submitted && (
                      <div className="bg-slate-950 border border-emerald-950 rounded-xl p-3 text-xs font-mono text-emerald-400">
                        <span className="font-semibold text-slate-400 block mb-1 font-sans">
                          Code Submitted:
                        </span>
                        <pre className="whitespace-pre-wrap">{answer.code_submitted}</pre>
                      </div>
                    )}

                    {/* 2. Actual / Expected Model Answer */}
                    {q.ideal_answer && (
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-100">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Actual / Expected Answer (Model Solution):</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {q.ideal_answer}
                        </p>
                      </div>
                    )}

                    {/* 3. AI Evaluator Feedback */}
                    {answer?.feedback && (
                      <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3.5 text-xs text-purple-200">
                        <span className="font-semibold text-purple-400 block mb-1">
                          AI Evaluator Feedback:
                        </span>
                        <p className="leading-relaxed">{answer.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
