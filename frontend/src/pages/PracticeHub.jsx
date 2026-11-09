import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Users, Cpu, Play, CheckCircle } from 'lucide-react';

export default function PracticeHub() {
  const navigate = useNavigate();

  const tracks = [
    {
      title: 'Data Structures & Algorithms',
      count: '45 Questions',
      level: 'All Levels',
      icon: Terminal,
      color: 'from-violet-600 to-indigo-600',
    },
    {
      title: 'STAR Behavioral Scenarios',
      count: '30 Questions',
      level: 'Mid to Senior',
      icon: Users,
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Distributed System Architecture',
      count: '25 Scenarios',
      level: 'Senior to Lead',
      icon: Cpu,
      color: 'from-cyan-600 to-blue-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Practice Hub
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Targeted drill categories for deep algorithmic and behavioral preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.title}
              className="bg-[#121522] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition shadow-lg group"
            >
              <div className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{t.count}</span>
                    <span>•</span>
                    <span className="text-purple-400 font-medium">{t.level}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigate('/configure')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Practice Drill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

