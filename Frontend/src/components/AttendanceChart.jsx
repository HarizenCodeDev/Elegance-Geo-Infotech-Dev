import React from "react";

// Simple inline line chart for employee attendance trends
const AttendanceChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxY = Math.max(...data.map((d) => d.value)) || 1;
  const padding = 16;
  const width = 600;
  const height = 260;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padding + innerH - (d.value / maxY) * innerH;
    return { ...d, x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Attendance Trend</p>
          <h4 className="text-lg font-semibold text-white">Last 7 Days</h4>
        </div>
        <div className="text-sm text-slate-300">Max: {maxY}</div>
      </div>

      <div className="overflow-x-auto">
        <svg width={width} height={height} className="min-w-full">
          <defs>
            <linearGradient id="attLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="attFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <g>
            {/* Area fill */}
            <path
              d={
                `${pathD} ` +
                `L ${points[points.length - 1].x.toFixed(2)} ${height - padding} ` +
                `L ${points[0].x.toFixed(2)} ${height - padding} Z`
              }
              fill="url(#attFill)"
              stroke="none"
            />
            {/* Line */}
            <path d={pathD} fill="none" stroke="url(#attLine)" strokeWidth="3" strokeLinecap="round" />
            {/* Points */}
            {points.map((p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r={4} fill="#22d3ee" />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="fill-slate-200 text-[10px]"
                >
                  {p.value}
                </text>
              </g>
            ))}
            {/* X labels */}
            {points.map((p) => (
              <text
                key={`${p.label}-x`}
                x={p.x}
                y={height - padding / 2}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {p.label}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AttendanceChart;
