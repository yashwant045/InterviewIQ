import React from 'react';

export default function RadarScore({
  scores = {
    professionalism: 88,
    attitude: 84,
    creativity: 82,
    communication: 86,
    leadership: 80,
    teamwork: 85,
  },
  size = 260,
}) {
  const axes = [
    { key: 'professionalism', label: 'Professionalism', angle: -90 },
    { key: 'attitude', label: 'Attitude', angle: -30 },
    { key: 'creativity', label: 'Creativity', angle: 30 },
    { key: 'communication', label: 'Communication', angle: 90 },
    { key: 'leadership', label: 'Leadership', angle: 150 },
    { key: 'teamwork', label: 'Teamwork', angle: 210 },
  ];

  const center = size / 2;
  const radius = size * 0.36;

  const getCoordinates = (value, angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  const polygonPoints = axes
    .map((axis) => {
      const val = scores[axis.key] ?? 75;
      const { x, y } = getCoordinates(val, axis.angle);
      return `${x},${y}`;
    })
    .join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric polygons */}
        {gridLevels.map((lvl, idx) => {
          const pts = axes
            .map((axis) => {
              const { x, y } = getCoordinates(100 * lvl, axis.angle);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="#2e354b"
              strokeWidth="1"
              strokeDasharray={lvl === 1.0 ? 'none' : '2 2'}
              className="opacity-70"
            />
          );
        })}

        {/* Axis radial lines */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(100, axis.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#2e354b"
              strokeWidth="1"
              className="opacity-60"
            />
          );
        })}

        {/* Data polygon with gradient fill */}
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.25" />
          </radialGradient>
        </defs>

        <polygon
          points={polygonPoints}
          fill="url(#radarGrad)"
          stroke="#a855f7"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Data points */}
        {axes.map((axis, i) => {
          const val = scores[axis.key] ?? 75;
          const { x, y } = getCoordinates(val, axis.angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#c084fc"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-700 ease-out shadow-sm"
            />
          );
        })}

        {/* Labels */}
        {axes.map((axis, i) => {
          const labelDist = radius + 22;
          const angleRad = (axis.angle * Math.PI) / 180;
          const lx = center + labelDist * Math.cos(angleRad);
          const ly = center + labelDist * Math.sin(angleRad);

          return (
            <text
              key={i}
              x={lx}
              y={ly + 4}
              textAnchor="middle"
              className="text-[10px] font-medium fill-slate-400 select-none tracking-tight"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

