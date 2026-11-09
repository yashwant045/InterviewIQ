import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, trend }) {
  return (
    <div className="bg-[#121520]/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 shadow-lg group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
      </div>

      {subtext && (
        <div className="mt-2 flex items-center text-xs text-slate-400">
          {trend && (
            <span className="text-emerald-400 font-semibold mr-1.5 flex items-center">
              ↗ {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}

