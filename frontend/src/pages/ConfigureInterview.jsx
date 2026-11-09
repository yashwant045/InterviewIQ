import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import {
  Sparkles,
  Building2,
  Briefcase,
  Sliders,
  Clock,
  Play,
  ArrowLeft,
  Check,
} from 'lucide-react';

export default function ConfigureInterview() {
  const navigate = useNavigate();

  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Senior Full Stack Engineer');
  const [difficulty, setDifficulty] = useState('Senior');
  const [type, setType] = useState('Technical');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const companies = [
    { name: 'Google', icon: '🔵' },
    { name: 'Meta', icon: '🔷' },
    { name: 'Amazon', icon: '🟠' },
    { name: 'Microsoft', icon: '🟩' },
    { name: 'Netflix', icon: '🔴' },
    { name: 'Stripe', icon: '🟣' },
    { name: 'High-Growth Startup', icon: '🚀' },
  ];

  const roles = [
    'Senior Full Stack Engineer',
    'Frontend Architect',
    'Backend Systems Engineer',
    'Distributed Systems Specialist',
    'UI/UX Designer',
    'Machine Learning Engineer',
    'DevOps / SRE Engineer',
  ];

  const tracks = [
    {
      id: 'Technical',
      title: 'Technical Interview',
      desc: 'Algorithms, data structures, live coding, and full-stack concepts.',
    },
    {
      id: 'Behavioral',
      title: 'Behavioral Interview',
      desc: 'STAR framework, situational judgment, leadership, and soft skills.',
    },
    {
      id: 'System Design',
      title: 'System Design Interview',
      desc: 'High-scale architecture, sharding, caching, and resiliency.',
    },
  ];

  const difficulties = ['Junior', 'Mid-Level', 'Senior', 'Lead'];
  const durations = [15, 30, 45, 60];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newInterview = await interviewService.createInterview({
        company,
        role,
        difficulty,
        type,
        duration_minutes: duration,
      });

      navigate(`/interview/${newInterview.id}`);
    } catch (err) {
      console.error('Failed to configure interview:', err);
      alert('Error creating interview session: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Configure Your Custom Interview
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Customize target company, focus track, difficulty, and duration for tailored simulation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Select Track */}
        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>1. Choose Interview Track</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tracks.map((t) => {
              const selected = type === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    selected
                      ? 'bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-900/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{t.title}</span>
                    {selected && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Target Company & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Company */}
          <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>2. Target Company</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {companies.map((c) => {
                const selected = company === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCompany(c.name)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition text-left ${
                      selected
                        ? 'bg-purple-900/30 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Role */}
          <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>3. Target Role</span>
            </label>
            <div className="space-y-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                AI will tailor question depth and scenario context to this exact job specification.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Difficulty & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty */}
          <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>4. Seniority / Difficulty</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {difficulties.map((d) => {
                const selected = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition text-center ${
                      selected
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-purple-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>5. Session Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((dur) => {
                const selected = duration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition text-center ${
                      selected
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {dur}m
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Launch CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-xl shadow-purple-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Initializing AI Session...' : 'Enter Live Interview Room'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

