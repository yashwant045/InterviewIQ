import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import StatCard from '../components/StatCard';
import {
  Sparkles,
  Terminal,
  Users2,
  Cpu,
  ArrowRight,
  Clock,
  Target,
  Award,
  Video,
  ChevronRight,
  Play,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingType, setStartingType] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await interviewService.getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.warn('Error loading dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleQuickStart = async (type) => {
    try {
      setStartingType(type);
      const newInterview = await interviewService.createInterview({
        company: 'Google',
        role: 'Full Stack Engineer',
        difficulty: 'Mid-Level',
        type: type,
        duration_minutes: 30,
      });

      // Navigate to live room
      navigate(`/interview/${newInterview.id}`);
    } catch (err) {
      console.error('Failed to create interview:', err);
      alert('Unable to start interview: ' + (err.response?.data?.message || err.message));
    } finally {
      setStartingType(null);
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Candidate';

  const completedCount = analytics?.completedCount ?? 0;
  const interviewsCount = analytics?.interviewsCount ?? 0;
  const avgScore = analytics?.averageScore ?? '0/10';
  const accuracyRate = analytics?.accuracyRate ?? '0%';
  const practiceTime = analytics?.practiceTime ?? '0m';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Welcome back, {displayName}!
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {completedCount > 0
            ? 'Here is an overview of your real-time performance progress. Keep up the momentum!'
            : 'Get started by taking your first live AI technical interview session below.'}
        </p>
      </div>

      {/* 4 Stat Overview Cards with Real-Time Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Interviews"
          value={interviewsCount}
          trend={completedCount > 0 ? `+${completedCount} completed` : null}
          subtext={completedCount > 0 ? 'total sessions' : 'No sessions yet'}
          icon={Video}
        />
        <StatCard
          label="Average Score"
          value={avgScore}
          trend={completedCount > 0 ? 'Live average' : null}
          subtext={completedCount > 0 ? 'across all sessions' : 'Pending first interview'}
          icon={Award}
        />
        <StatCard
          label="Accuracy Rate"
          value={accuracyRate}
          trend={completedCount > 0 ? 'Real-time benchmark' : null}
          subtext={completedCount > 0 ? 'technical clarity' : 'Pending first interview'}
          icon={Target}
        />
        <StatCard
          label="Practice Time"
          value={practiceTime}
          trend={completedCount > 0 ? 'Total logged' : null}
          subtext={completedCount > 0 ? 'in mock sessions' : '0 minutes recorded'}
          icon={Clock}
        />
      </div>

      {/* Real-time onboarding callout if no interviews completed yet */}
      {completedCount === 0 && (
        <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between text-xs text-violet-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Real-time analytics are waiting for your first interview. Launch any track below to generate live radar scores!
            </span>
          </div>
          <button
            onClick={() => handleQuickStart('Technical')}
            className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition shrink-0"
          >
            Start Now
          </button>
        </div>
      )}

      {/* Custom Interview Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/60 via-purple-900/30 to-[#131622] border border-violet-500/30 p-6 md:p-8 shadow-2xl backdrop-blur">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Interview</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Tailor your interview experience to match your specific needs and goals
            </h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Choose difficulty, duration, focus areas, company target, and interview types for targeted practice.
            </p>
          </div>

          <button
            onClick={() => navigate('/configure')}
            className="self-start md:self-center px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xs md:text-sm shadow-xl shadow-purple-900/40 transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            <span>Configure Now</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Start a New Interview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Start a New Interview</h2>
          <span className="text-xs text-purple-400">Select a structured track</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Technical Interview */}
          <div className="bg-[#121522]/80 rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-violet-500/50 hover:bg-[#141826] transition-all duration-300 group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-violet-600/25 transition">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Technical Interview</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Test your coding, algorithms, full-stack concepts, and live data structure implementation under pressure.
              </p>
            </div>

            <div className="pt-6">
              <button
                disabled={startingType === 'Technical'}
                onClick={() => handleQuickStart('Technical')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition group-hover:bg-violet-600 shadow-md disabled:opacity-50"
              >
                <span>{startingType === 'Technical' ? 'Initializing...' : 'Start Technical'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Behavioral Interview */}
          <div className="bg-[#121522]/80 rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-[#141826] transition-all duration-300 group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600/25 transition">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Behavioral Interview</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Master the STAR method, leadership dilemmas, team collaboration, and high-impact situation responses.
              </p>
            </div>

            <div className="pt-6">
              <button
                disabled={startingType === 'Behavioral'}
                onClick={() => handleQuickStart('Behavioral')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition group-hover:bg-purple-600 shadow-md disabled:opacity-50"
              >
                <span>{startingType === 'Behavioral' ? 'Initializing...' : 'Start Behavioral'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: System Design Interview */}
          <div className="bg-[#121522]/80 rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-fuchsia-500/50 hover:bg-[#141826] transition-all duration-300 group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-600/15 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-fuchsia-600/25 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">System Design Interview</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Practice designing high-scale, robust distributed systems, caching hierarchies, and fault-tolerant architectures.
              </p>
            </div>

            <div className="pt-6">
              <button
                disabled={startingType === 'System Design'}
                onClick={() => handleQuickStart('System Design')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-fuchsia-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition group-hover:bg-fuchsia-600 shadow-md disabled:opacity-50"
              >
                <span>{startingType === 'System Design' ? 'Initializing...' : 'Start System Design'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
