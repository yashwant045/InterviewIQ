import React from 'react';

export default function WorkmapBars({
  scores = {
    presentation: 90,
    opportunistic: 60,
    businessAcumen: 85,
    closingTechnique: 40,
  },
}) {
  const items = [
    { key: 'presentation', label: 'Presentation', value: scores.presentation ?? 90, color: 'from-violet-500 to-purple-500' },
    { key: 'opportunistic', label: 'Opportunistic', value: scores.opportunistic ?? 60, color: 'from-blue-500 to-cyan-500' },
    { key: 'businessAcumen', label: 'Business Acumen', value: scores.businessAcumen ?? 85, color: 'from-pink-500 to-rose-500' },
    { key: 'closingTechnique', label: 'Closing Technique', value: scores.closingTechnique ?? 40, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div key={item.key} className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">{item.label}</span>
            <span className="text-slate-400 font-semibold">{Math.round(item.value)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(100, Math.max(5, item.value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

