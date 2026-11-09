import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import {
  History,
  Calendar,
  Building,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await interviewService.getInterviews();
        setInterviews(data || []);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Interview History
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Review past mock interview sessions, feedback, and performance progression.
          </p>
        </div>

        <button
          onClick={() => navigate('/configure')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          New Interview
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading interview archives...
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <History className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No interviews completed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Take your first AI mock interview session to unlock comprehensive radar evaluations and performance reports.
          </p>
          <button
            onClick={() => navigate('/configure')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                item.status === 'COMPLETED'
                  ? navigate(`/report/${item.id}`)
                  : navigate(`/interview/${item.id}`)
              }
              className="bg-[#121522] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 cursor-pointer shadow-md group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {item.role}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-medium text-purple-400">{item.company}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.duration_minutes || 30} mins
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.status}
                </span>

                <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-purple-600 text-slate-400 group-hover:text-white transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

