import React, { useState } from 'react';
import { MonthlyScreeningRecord } from '../types/mentalHealth';
import { TrendingUp, TrendingDown, Activity, Moon, AlertTriangle, ArrowUpRight, HelpCircle, Eye } from 'lucide-react';

interface EmotionalChartsProps {
  records: MonthlyScreeningRecord[];
  onSelectRecord: (record: MonthlyScreeningRecord) => void;
  onStartNewScreening: () => void;
  onOpenCounselingWithData: (record: MonthlyScreeningRecord) => void;
}

export const EmotionalCharts: React.FC<EmotionalChartsProps> = ({
  records,
  onSelectRecord,
  onStartNewScreening,
  onOpenCounselingWithData,
}) => {
  const [visibleSeries, setVisibleSeries] = useState({
    depression: true,
    anxiety: true,
    stress: true,
    wellbeing: true,
  });

  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Latest record
  const latestRecord = records[records.length - 1];
  const previousRecord = records.length > 1 ? records[records.length - 2] : null;

  const wellbeingDelta = previousRecord
    ? latestRecord.wellbeingIndex - previousRecord.wellbeingIndex
    : 0;
  const stressDelta = previousRecord
    ? latestRecord.stress.score - previousRecord.stress.score
    : 0;

  // Chart coordinate calculations for SVG
  const chartWidth = 740;
  const chartHeight = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxScore = 42;
  const stepX = records.length > 1 ? graphWidth / (records.length - 1) : graphWidth / 2;

  const getPoints = (getValue: (r: MonthlyScreeningRecord) => number) => {
    return records.map((r, i) => {
      const x = padding.left + i * stepX;
      const val = getValue(r);
      const y = padding.top + graphHeight - (val / maxScore) * graphHeight;
      return { x, y, val, month: r.month, record: r };
    });
  };

  const getWellbeingPoints = () => {
    return records.map((r, i) => {
      const x = padding.left + i * stepX;
      // Wellbeing is 0-100, mapped to height
      const y = padding.top + graphHeight - (r.wellbeingIndex / 100) * graphHeight;
      return { x, y, val: r.wellbeingIndex, month: r.month, record: r };
    });
  };

  const depPoints = getPoints((r) => r.depression.score);
  const anxPoints = getPoints((r) => r.anxiety.score);
  const strPoints = getPoints((r) => r.stress.score);
  const wbPoints = getWellbeingPoints();

  const createSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Smooth cubic bezier
      const prev = points[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, '');
  };

  // Radar chart points for 5 emotional dimensions
  const radarDimensions = [
    { label: 'Ketahanan Emosi', current: (latestRecord?.wellbeingIndex ?? 70) / 100, baseline: 0.75 },
    { label: 'Stabilitas Akademik', current: latestRecord?.stress.severity === 'Normal' ? 0.9 : latestRecord?.stress.severity === 'Ringan' ? 0.7 : 0.45, baseline: 0.65 },
    { label: 'Kualitas Tidur', current: Math.min(1, (latestRecord?.sleepHoursAverage ?? 6.5) / 8), baseline: 0.7 },
    { label: 'Ketenangan Sosial', current: latestRecord?.anxiety.severity === 'Normal' ? 0.9 : latestRecord?.anxiety.severity === 'Ringan' ? 0.75 : 0.5, baseline: 0.6 },
    { label: 'Motivasi Diri', current: latestRecord?.depression.severity === 'Normal' ? 0.88 : latestRecord?.depression.severity === 'Ringan' ? 0.72 : 0.48, baseline: 0.7 },
  ];

  const radarCenterX = 130;
  const radarCenterY = 120;
  const radarRadius = 80;

  const getRadarPoint = (index: number, total: number, ratio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radarRadius * ratio;
    const x = radarCenterX + r * Math.cos(angle);
    const y = radarCenterY + r * Math.sin(angle);
    return { x, y };
  };

  const radarCurrentPolygon = radarDimensions.map((d, i) => {
    const p = getRadarPoint(i, radarDimensions.length, d.current);
    return `${p.x},${p.y}`;
  }).join(' ');

  const radarBaselinePolygon = radarDimensions.map((d, i) => {
    const p = getRadarPoint(i, radarDimensions.length, d.baseline);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div className="space-y-8">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wellbeing Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Indeks Kesejahteraan Emosional</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {latestRecord ? `${latestRecord.wellbeingIndex}%` : '74%'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {latestRecord?.wellbeingIndex && latestRecord.wellbeingIndex >= 70
                ? 'Kondisi Baik'
                : 'Perlu Perhatian'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {wellbeingDelta >= 0 ? (
              <span className="text-emerald-700 font-medium flex items-center font-mono tabular-nums">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{wellbeingDelta}%
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center font-mono tabular-nums">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {wellbeingDelta}%
              </span>
            )}
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">dibanding bulan lalu</span>
          </div>
        </div>

        {/* Depresi Score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Tingkat Depresi (DASS-21)</span>
            <span className="text-xs text-slate-400">0 - 42</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {latestRecord?.depression.score ?? 10}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: latestRecord?.depression.color ?? '#10B981' }}
            >
              {latestRecord?.depression.severity ?? 'Ringan'}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 truncate">
            Ambang normal: 0–9 · Sedang: 14–20
          </p>
        </div>

        {/* Kecemasan Score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Tingkat Kecemasan (Anxiety)</span>
            <span className="text-xs text-slate-400">0 - 42</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {latestRecord?.anxiety.score ?? 10}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: latestRecord?.anxiety.color ?? '#F59E0B' }}
            >
              {latestRecord?.anxiety.severity ?? 'Sedang'}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 truncate">
            Ambang normal: 0–7 · Sedang: 10–14
          </p>
        </div>

        {/* Tingkat Stres & Pola Tidur */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Stres & Rata-rata Tidur</span>
            <Moon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {latestRecord?.stress.score ?? 16}
            </span>
            <span className="text-xs text-slate-500">
              ({latestRecord?.stress.severity ?? 'Ringan'})
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <span>Tidur: <strong className="font-mono tabular-nums text-slate-900">{latestRecord?.sleepHoursAverage ?? 6.5} jam/hari</strong></span>
            <span className="text-slate-300">|</span>
            <span>Beban: <strong className="text-slate-900">{latestRecord?.academicPressureLevel ?? 'Sedang'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Interactive Visual Line Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Grafik Perkembangan Emosional Berkala (Bulan ke Bulan)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi tren DASS-21 dan Indeks Kesejahteraan semester berjalan. Arahkan kursor untuk melihat rincian bulan.
            </p>
          </div>

          {/* Metric Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() =>
                setVisibleSeries((prev) => ({ ...prev, depression: !prev.depression }))
              }
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                visibleSeries.depression
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              ● Depresi
            </button>
            <button
              onClick={() =>
                setVisibleSeries((prev) => ({ ...prev, anxiety: !prev.anxiety }))
              }
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                visibleSeries.anxiety
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              ● Kecemasan
            </button>
            <button
              onClick={() =>
                setVisibleSeries((prev) => ({ ...prev, stress: !prev.stress }))
              }
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                visibleSeries.stress
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              ● Stres
            </button>
            <button
              onClick={() =>
                setVisibleSeries((prev) => ({ ...prev, wellbeing: !prev.wellbeing }))
              }
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                visibleSeries.wellbeing
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              ● Kesejahteraan (%)
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative overflow-x-auto">
          <div className="min-w-[680px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Reference Grid lines */}
              {[0, 10, 20, 30, 40].map((val) => {
                const y = padding.top + graphHeight - (val / maxScore) * graphHeight;
                return (
                  <g key={`grid-${val}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Clinical Threshold Guide Zones */}
              <line
                x1={padding.left}
                y1={padding.top + graphHeight - (14 / maxScore) * graphHeight}
                x2={chartWidth - padding.right}
                y2={padding.top + graphHeight - (14 / maxScore) * graphHeight}
                stroke="#FDE68A"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={chartWidth - padding.right}
                y={padding.top + graphHeight - (14 / maxScore) * graphHeight - 4}
                textAnchor="end"
                className="text-[9px] fill-amber-500 font-medium"
              >
                Ambang Sedang (14)
              </text>

              {/* Series Lines */}
              {visibleSeries.depression && (
                <path
                  d={createSvgPath(depPoints)}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {visibleSeries.anxiety && (
                <path
                  d={createSvgPath(anxPoints)}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {visibleSeries.stress && (
                <path
                  d={createSvgPath(strPoints)}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {visibleSeries.wellbeing && (
                <path
                  d={createSvgPath(
                    wbPoints.map((p) => ({
                      x: p.x,
                      // Scale 0-100 to same graph height visually
                      y: padding.top + graphHeight - (p.val / 100) * graphHeight,
                    }))
                  )}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              )}

              {/* Data Point Circles and Vertical Guides */}
              {records.map((r, i) => {
                const x = padding.left + i * stepX;
                const isHovered = hoveredMonthIndex === i;

                return (
                  <g key={`data-col-${r.id}`}>
                    {/* Month X-Axis Label */}
                    <text
                      x={x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      className={`text-xs font-medium cursor-pointer transition-colors ${
                        isHovered ? 'fill-teal-700 font-bold' : 'fill-slate-600'
                      }`}
                      onClick={() => onSelectRecord(r)}
                    >
                      {r.month.split(' ')[0]}
                    </text>

                    {/* Vertical hover highlight line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={chartHeight - padding.bottom}
                        stroke="#99F6E4"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Interactive invisible hit area */}
                    <rect
                      x={x - stepX / 2}
                      y={padding.top}
                      width={stepX}
                      height={graphHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIndex(i)}
                      onMouseLeave={() => setHoveredMonthIndex(null)}
                      onClick={() => onSelectRecord(r)}
                    />

                    {/* Points */}
                    {visibleSeries.depression && (
                      <circle
                        cx={depPoints[i].x}
                        cy={depPoints[i].y}
                        r={isHovered ? 5.5 : 4}
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    )}
                    {visibleSeries.anxiety && (
                      <circle
                        cx={anxPoints[i].x}
                        cy={anxPoints[i].y}
                        r={isHovered ? 5.5 : 4}
                        fill="#F59E0B"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    )}
                    {visibleSeries.stress && (
                      <circle
                        cx={strPoints[i].x}
                        cy={strPoints[i].y}
                        r={isHovered ? 5.5 : 4}
                        fill="#F43F5E"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    )}
                    {visibleSeries.wellbeing && (
                      <circle
                        cx={wbPoints[i].x}
                        cy={padding.top + graphHeight - (wbPoints[i].val / 100) * graphHeight}
                        r={isHovered ? 5 : 3.5}
                        fill="#0D9488"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Hover Inspection Card if active */}
        {hoveredMonthIndex !== null && records[hoveredMonthIndex] && (
          <div className="mt-4 p-4 bg-teal-50/60 rounded-lg border border-teal-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-900 text-sm">
                  {records[hoveredMonthIndex].month}
                </span>
                <span>·</span>
                <span>{records[hoveredMonthIndex].academicPeriod}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span>
                  Depresi:{' '}
                  <strong className="font-mono tabular-nums text-emerald-800">
                    {records[hoveredMonthIndex].depression.score}
                  </strong>{' '}
                  ({records[hoveredMonthIndex].depression.severity})
                </span>
                <span>·</span>
                <span>
                  Kecemasan:{' '}
                  <strong className="font-mono tabular-nums text-amber-800">
                    {records[hoveredMonthIndex].anxiety.score}
                  </strong>{' '}
                  ({records[hoveredMonthIndex].anxiety.severity})
                </span>
                <span>·</span>
                <span>
                  Stres:{' '}
                  <strong className="font-mono tabular-nums text-rose-800">
                    {records[hoveredMonthIndex].stress.score}
                  </strong>{' '}
                  ({records[hoveredMonthIndex].stress.severity})
                </span>
                <span>·</span>
                <span>
                  Kesejahteraan:{' '}
                  <strong className="font-mono tabular-nums text-teal-800">
                    {records[hoveredMonthIndex].wellbeingIndex}%
                  </strong>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Isu dominan: {records[hoveredMonthIndex].dominantIssues.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectRecord(records[hoveredMonthIndex])}
                className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-800 font-medium rounded border border-slate-200 transition-colors"
              >
                Lihat Detail Skrining
              </button>
              <button
                onClick={() => onOpenCounselingWithData(records[hoveredMonthIndex])}
                className="px-3 py-1.5 text-xs bg-teal-700 hover:bg-teal-800 text-white font-medium rounded transition-colors"
              >
                Konseling Berbasis Data Ini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Split: Radar 5 Dimensi & Korelasi Pola Tidur */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: 5 Dimensi Kesehatan Mental Mahasiswa */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900">
              Profil Keseimbangan Psikososial Mahasiswa
            </h4>
            <p className="text-xs text-slate-500">
              Pemetaan 5 domain kunci kondisi mental bulan {latestRecord?.month || 'terakhir'}. Garis putus-putus menunjukkan ambang ideal kampus.
            </p>
          </div>

          <div className="flex items-center justify-center py-2">
            <svg width="260" height="240" className="overflow-visible select-none">
              {/* Concentric radar web */}
              {[0.25, 0.5, 0.75, 1].map((r) => (
                <circle
                  key={`radar-ring-${r}`}
                  cx={radarCenterX}
                  cy={radarCenterY}
                  r={radarRadius * r}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
              ))}

              {/* Axis spokes */}
              {radarDimensions.map((d, i) => {
                const pt = getRadarPoint(i, radarDimensions.length, 1);
                return (
                  <line
                    key={`spoke-${i}`}
                    x1={radarCenterX}
                    y1={radarCenterY}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Baseline target area */}
              <polygon
                points={radarBaselinePolygon}
                fill="#F1F5F9"
                fillOpacity="0.4"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Current Student Polygon */}
              <polygon
                points={radarCurrentPolygon}
                fill="#0D9488"
                fillOpacity="0.25"
                stroke="#0D9488"
                strokeWidth="2"
              />

              {/* Dimension Labels */}
              {radarDimensions.map((d, i) => {
                const pt = getRadarPoint(i, radarDimensions.length, 1.25);
                return (
                  <text
                    key={`lbl-${i}`}
                    x={pt.x}
                    y={pt.y + 4}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-700 font-medium"
                  >
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-teal-600 inline-block rounded"></span>
              Skor Mahasiswa Saat Ini
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-400 inline-block rounded border-dashed"></span>
              Standar Target Kampus
            </span>
          </div>
        </div>

        {/* Pola Tidur & Korelasi Beban Akademik */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Korelasi Beban Akademik & Durasi Tidur
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Kurang tidur secara konsisten berkorelasi langsung dengan kenaikan skor kecemasan di masa ujian (UTS/UAS).
            </p>

            <div className="space-y-3.5">
              {records.map((r) => {
                const sleepPercent = Math.min(100, (r.sleepHoursAverage / 9) * 100);
                return (
                  <div key={`sleep-row-${r.id}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{r.month}</span>
                      <div className="flex items-center gap-2 text-slate-500 font-mono tabular-nums text-[11px]">
                        <span>Tidur: {r.sleepHoursAverage} jam</span>
                        <span>·</span>
                        <span className={r.academicPressureLevel === 'Tinggi' ? 'text-amber-700 font-semibold' : ''}>
                          Beban: {r.academicPressureLevel}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all ${
                          r.sleepHoursAverage >= 7
                            ? 'bg-emerald-500'
                            : r.sleepHoursAverage >= 6
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${sleepPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              <strong>Insight Konselor:</strong> Pada bulan Oktober saat pekan UTS, rata-rata tidur turun hingga 5.1 jam yang memicu lonjakan skor kecemasan ke level 16 (Berat). Menjaga minimal 6.5–7 jam tidur adalah pelindung utama kesehatan emosional Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Scannable Historical Screening Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Riwayat Lengkap Skrining Bulanan Mahasiswa
            </h4>
            <p className="text-xs text-slate-500">
              Data tersimpan berkala setiap semester untuk pemantauan berkelanjutan
            </p>
          </div>
          <button
            onClick={onStartNewScreening}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            + Isi Skrining Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Periode Skrining</th>
                <th className="py-3 px-4 font-semibold text-right">Depresi</th>
                <th className="py-3 px-4 font-semibold text-right">Kecemasan</th>
                <th className="py-3 px-4 font-semibold text-right">Stres</th>
                <th className="py-3 px-4 font-semibold text-right">Kesejahteraan</th>
                <th className="py-3 px-4 font-semibold">Status / Isu Utama</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{r.month}</span>
                    <span className="text-[11px] text-slate-500">{r.academicPeriod}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono tabular-nums font-semibold block text-slate-900">
                      {r.depression.score}
                    </span>
                    <span className="text-[11px]" style={{ color: r.depression.color }}>
                      {r.depression.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono tabular-nums font-semibold block text-slate-900">
                      {r.anxiety.score}
                    </span>
                    <span className="text-[11px]" style={{ color: r.anxiety.color }}>
                      {r.anxiety.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono tabular-nums font-semibold block text-slate-900">
                      {r.stress.score}
                    </span>
                    <span className="text-[11px]" style={{ color: r.stress.color }}>
                      {r.stress.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono tabular-nums font-bold text-teal-800 text-sm">
                      {r.wellbeingIndex}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-600 line-clamp-1">
                      {r.dominantIssues.join(' · ')}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectRecord(r)}
                      className="px-2.5 py-1 text-slate-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 hover:bg-slate-100 rounded transition-colors mr-2"
                      title="Lihat Detail Laporan"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </button>
                    <button
                      onClick={() => onOpenCounselingWithData(r)}
                      className="px-2.5 py-1 text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                    >
                      Konseling <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
