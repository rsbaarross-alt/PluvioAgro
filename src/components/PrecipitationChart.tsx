import React, { useState } from 'react';
import { RainRecord } from '../types';
import { formatDateBr, formatMm } from '../utils/formatters';
import { BarChart2, TrendingUp, Droplets } from 'lucide-react';

interface Props {
  records: RainRecord[];
  harvestStartDate?: string;
  harvestEndDate?: string;
}

type PeriodMode = '15d' | '30d' | 'months';
type ChartType = 'bars' | 'line';

export const PrecipitationChart: React.FC<Props> = ({ records, harvestStartDate, harvestEndDate }) => {
  const [period, setPeriod] = useState<PeriodMode>('15d');
  const [chartType, setChartType] = useState<ChartType>('bars');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Helper to generate date ranges
  const generateChartData = () => {
    if (period === 'months') {
      const monthsMap: { [key: string]: { label: string; subLabel: string; totalMm: number; count: number } } = {};
      
      const start = harvestStartDate ? new Date(harvestStartDate) : new Date(Date.now() - 180 * 86400000);
      const end = harvestEndDate ? new Date(harvestEndDate) : new Date();

      const curr = new Date(start.getFullYear(), start.getMonth(), 1);
      const maxEnd = new Date(end.getFullYear(), end.getMonth() + 1, 0);

      while (curr <= maxEnd) {
        const ym = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        const monthShort = curr.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        const label = `${monthShort}/${String(curr.getFullYear()).slice(-2)}`;
        monthsMap[ym] = {
          label,
          subLabel: String(curr.getFullYear()),
          totalMm: 0,
          count: 0,
        };
        curr.setMonth(curr.getMonth() + 1);
      }

      records.forEach(rec => {
        const ym = rec.date.slice(0, 7);
        if (monthsMap[ym]) {
          monthsMap[ym].totalMm += rec.amountMm;
          monthsMap[ym].count += 1;
        }
      });

      return Object.entries(monthsMap).map(([key, data]) => ({
        key,
        label: data.label,
        subLabel: `${data.count} ${data.count === 1 ? 'dia' : 'dias'}`,
        value: Math.round(data.totalMm * 10) / 10,
        count: data.count,
      }));
    } else {
      const daysCount = period === '15d' ? 15 : 30;
      const days: { key: string; label: string; subLabel: string; value: number; count: number }[] = [];
      const today = new Date();

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase();

        const dayRecords = records.filter(r => r.date === iso);
        const dayTotal = dayRecords.reduce((sum, r) => sum + r.amountMm, 0);

        days.push({
          key: iso,
          label: dayLabel,
          subLabel: weekday,
          value: Math.round(dayTotal * 10) / 10,
          count: dayRecords.length,
        });
      }

      return days;
    }
  };

  const chartData = generateChartData();
  const maxRecorded = Math.max(...chartData.map(d => d.value), 0);
  const totalPeriodMm = Math.round(chartData.reduce((acc, curr) => acc + curr.value, 0) * 10) / 10;
  const rainyDaysInPeriod = chartData.filter(d => d.value > 0).length;

  // Proportional dynamic Y-axis scale with adequate headroom so numbers never clip
  const getNiceScale = (maxVal: number) => {
    if (maxVal <= 0) return { max: 20, steps: [20, 10, 0] };
    if (maxVal <= 15) return { max: 20, steps: [20, 10, 0] };
    if (maxVal <= 25) return { max: 35, steps: [35, 20, 0] };
    if (maxVal <= 50) return { max: 65, steps: [65, 35, 0] };
    if (maxVal <= 80) return { max: 100, steps: [100, 50, 0] };
    if (maxVal <= 120) return { max: 150, steps: [150, 75, 0] };
    if (maxVal <= 200) return { max: 240, steps: [240, 120, 0] };
    if (maxVal <= 300) return { max: 360, steps: [360, 180, 0] };
    const step = Math.ceil((maxVal * 1.25) / 3 / 25) * 25;
    const max = step * 3;
    return { max, steps: [max, Math.round(max * 0.66), Math.round(max * 0.33), 0] };
  };

  const scale = getNiceScale(maxRecorded);
  const maxValue = scale.max;

  // Pre-calculate line chart SVG path points (viewBox 0 0 1000 200)
  const svgPoints = chartData.map((d, i) => {
    const x = ((i + 0.5) / chartData.length) * 1000;
    const y = maxValue > 0 ? 175 - (d.value / maxValue) * 145 : 175;
    return { x, y, value: d.value };
  });

  const linePathD = svgPoints.length > 0
    ? svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';

  const areaPathD = svgPoints.length > 0
    ? `${linePathD} L ${svgPoints[svgPoints.length - 1].x.toFixed(1)},175 L ${svgPoints[0].x.toFixed(1)},175 Z`
    : '';

  return (
    <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
            {chartType === 'bars' ? (
              <BarChart2 className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
            )}
            <span>Precipitação por Período</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total do período: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatMm(totalPeriodMm)}</strong> ({rainyDaysInPeriod} {rainyDaysInPeriod === 1 ? 'dia chuvoso' : 'dias chuvosos'})
          </p>
        </div>

        {/* View Controls: [ Barras | Linhas ] and [ 15 Dias | 30 Dias | Meses ] */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Chart Type Toggle: Barras | Linhas */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setChartType('bars')}
              className={`py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 rounded transition-colors ${
                chartType === 'bars'
                  ? 'bg-[#143D2B] text-white font-semibold shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a2330]'
              }`}
              title="Visualizar em gráfico de Barras"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 rounded transition-colors ${
                chartType === 'line'
                  ? 'bg-[#143D2B] text-white font-semibold shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a2330]'
              }`}
              title="Visualizar em gráfico de Linhas"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Linhas</span>
            </button>
          </div>

          {/* Period Selector Tabs */}
          <div className="grid grid-cols-3 sm:flex p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setPeriod('15d')}
              className={`py-1.5 px-3 text-center rounded transition-colors truncate ${
                period === '15d'
                  ? 'bg-[#143D2B] text-white font-semibold shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a2330]'
              }`}
            >
              15 Dias
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              className={`py-1.5 px-3 text-center rounded transition-colors truncate ${
                period === '30d'
                  ? 'bg-[#143D2B] text-white font-semibold shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a2330]'
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setPeriod('months')}
              className={`py-1.5 px-3 text-center rounded transition-colors truncate ${
                period === 'months'
                  ? 'bg-[#143D2B] text-white font-semibold shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a2330]'
              }`}
            >
              Meses
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full select-none pt-4">
        {/* Subtle Horizontal Background Guidelines (Full Width, without right scale numbers) */}
        <div className="absolute inset-x-0 top-4 bottom-7 pointer-events-none flex flex-col justify-between z-0">
          {scale.steps.map((_, idx) => (
            <div
              key={idx}
              className="border-b border-dashed border-slate-200/80 dark:border-slate-800/80 w-full"
            />
          ))}
        </div>

        {/* Dynamic Chart Viewport */}
        <div className="relative z-10 w-full">
          {chartType === 'bars' ? (
            /* ========================================================================= */
            /* VISUALIZAÇÃO EM BARRAS                                                    */
            /* ========================================================================= */
            <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 h-48 sm:h-52 w-full pb-1">
              {chartData.map((item, idx) => {
                const rawPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                const hasRain = item.value > 0;
                const isHovered = hoveredIndex === idx;
                const displayVal = item.value >= 10 ? Math.round(item.value) : item.value.toFixed(1).replace('.', ',');

                return (
                  <div
                    key={item.key}
                    className="flex-1 min-w-0 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
                    onTouchStart={() => setHoveredIndex(idx)}
                  >
                    {/* Bar Wrapper */}
                    <div
                      className="relative w-full flex flex-col items-center justify-end"
                      style={{
                        height: hasRain ? `${Math.max(rawPercent, 5)}%` : '3px',
                      }}
                    >
                      {/* Floating Detailed Tooltip on Hover Close to Bar Top */}
                      {isHovered && (
                        <div
                          className={`absolute z-40 bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 text-white rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-xl pointer-events-none transition-all duration-150 backdrop-blur-xs text-center ${
                            rawPercent >= 68
                              ? 'top-full mt-2.5'
                              : hasRain
                              ? 'bottom-full mb-6'
                              : 'bottom-full mb-2.5'
                          } ${
                            idx === 0
                              ? 'left-0 translate-x-0'
                              : idx === 1 && chartData.length >= 25
                              ? 'left-0 translate-x-1'
                              : idx === chartData.length - 1
                              ? 'right-0 left-auto translate-x-0'
                              : idx === chartData.length - 2 && chartData.length >= 25
                              ? 'right-0 left-auto -translate-x-1'
                              : 'left-1/2 -translate-x-1/2'
                          }`}
                        >
                          <div className="font-bold text-emerald-400 text-xs sm:text-sm leading-tight flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{formatMm(item.value)}</span>
                          </div>
                          <div className="text-[10px] text-slate-300 dark:text-slate-300 mt-0.5 leading-tight font-medium">
                            {period === 'months' ? item.label : formatDateBr(item.key)}
                          </div>
                          {item.count > 0 && (
                            <div className="text-[9px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">
                              {item.count} {item.count === 1 ? 'registro' : 'registros'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dynamic Numerical Value Label attached to the bar apex */}
                      {hasRain && (
                        <div className="absolute bottom-full mb-1 flex items-center justify-center pointer-events-none select-none z-10 w-full">
                          <span
                            className={`text-[9px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap leading-none transition-colors ${
                              isHovered
                                ? 'text-[#143D2B] dark:text-emerald-400 font-extrabold'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {displayVal}
                          </span>
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div
                        className={`w-full max-w-[15px] sm:max-w-[22px] h-full rounded-t transition-colors ${
                          hasRain
                            ? isHovered
                              ? 'bg-[#0F2D1F] dark:bg-emerald-600'
                              : 'bg-[#143D2B] dark:bg-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-800 rounded-xs'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* VISUALIZAÇÃO EM LINHAS                                                    */
            /* ========================================================================= */
            <div className="relative w-full h-48 sm:h-52">
              {/* Vector Connecting Line and Area Fill */}
              <svg
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
              >
                <defs>
                  <linearGradient id="rainLineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Area Fill */}
                {areaPathD && (
                  <path
                    d={areaPathD}
                    fill="url(#rainLineAreaGrad)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Connecting Line */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    className="stroke-[#143D2B] dark:stroke-emerald-400 transition-all duration-300"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {/* Interactive Columns with Defined Points and Value Labels */}
              <div className="relative z-20 w-full h-full flex items-stretch">
                {chartData.map((item, idx) => {
                  const hasRain = item.value > 0;
                  const isHovered = hoveredIndex === idx;
                  const displayVal = item.value >= 10 ? Math.round(item.value) : item.value.toFixed(1).replace('.', ',');
                  const bottomPercent = 12 + (maxValue > 0 ? (item.value / maxValue) * 73 : 0);

                  return (
                    <div
                      key={item.key}
                      className="flex-1 min-w-0 h-full relative cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
                      onTouchStart={() => setHoveredIndex(idx)}
                    >
                      {/* 1. Linha-guia vertical fina e tracejada da data no eixo inferior até o ponto */}
                      {isHovered && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-px border-l border-dashed border-slate-400/80 dark:border-emerald-400/80 pointer-events-none z-10 transition-all duration-150"
                          style={{ height: `${bottomPercent}%` }}
                        />
                      )}

                      {/* Point Marker & Value Wrapper */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                        style={{ bottom: `${bottomPercent}%` }}
                      >
                        {/* 2. Tooltip / Card próximo ao ponto selecionado */}
                        {isHovered && (
                          <div
                            className={`absolute z-40 bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 text-white rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-xl pointer-events-none transition-all duration-150 backdrop-blur-xs text-center ${
                              bottomPercent >= 68
                                ? 'top-full mt-3'
                                : hasRain
                                ? 'bottom-full mb-6'
                                : 'bottom-full mb-3'
                            } ${
                              idx === 0
                                ? 'left-0 translate-x-0'
                                : idx === 1 && chartData.length >= 25
                                ? 'left-0 translate-x-1'
                                : idx === chartData.length - 1
                                ? 'right-0 left-auto translate-x-0'
                                : idx === chartData.length - 2 && chartData.length >= 25
                                ? 'right-0 left-auto -translate-x-1'
                                : 'left-1/2 -translate-x-1/2'
                            }`}
                          >
                            <div className="font-bold text-emerald-400 text-xs sm:text-sm leading-tight flex items-center justify-center gap-1">
                              <Droplets className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{formatMm(item.value)}</span>
                            </div>
                            <div className="text-[10px] text-slate-300 dark:text-slate-300 mt-0.5 leading-tight font-medium">
                              {period === 'months' ? item.label : formatDateBr(item.key)}
                            </div>
                            {item.count > 0 && (
                              <div className="text-[9px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">
                                {item.count} {item.count === 1 ? 'registro' : 'registros'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Value above each point with precipitation (ex: 86 mm, 33 mm, 96 mm) */}
                        {hasRain && (
                          <div className="absolute bottom-full mb-1 flex items-center justify-center whitespace-nowrap z-20">
                            <span
                              className={`text-[9px] sm:text-[11px] font-bold tracking-tight px-1 py-0.5 rounded leading-none transition-colors ${
                                isHovered
                                  ? 'bg-[#143D2B] text-white dark:bg-emerald-400 dark:text-slate-950 font-extrabold shadow-sm'
                                  : 'text-slate-900 dark:text-slate-100 bg-white/90 dark:bg-[#121820]/90 backdrop-blur-2xs'
                              }`}
                            >
                              {displayVal} mm
                            </span>
                          </div>
                        )}

                        {/* Well-defined point marker */}
                        {hasRain ? (
                          <div
                            className={`rounded-full transition-transform ${
                              isHovered ? 'scale-125' : ''
                            } w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#143D2B] dark:bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center`}
                          >
                            <div className="w-1 h-1 rounded-full bg-white dark:bg-slate-950" />
                          </div>
                        ) : (
                          <div
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              isHovered ? 'bg-[#143D2B] dark:bg-emerald-400 scale-125' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* X-Axis Labels Row */}
          <div className="flex items-start gap-1 sm:gap-1.5 md:gap-2 w-full pt-1.5 border-t border-slate-200 dark:border-slate-800">
            {chartData.map((item, idx) => {
              const hasRain = item.value > 0;
              const isHovered = hoveredIndex === idx;
              const dayNum = item.label.split('/')[0] || item.label;

              const showMobileLabel =
                period === 'months' ||
                period === '15d' ||
                idx === 0 ||
                idx === chartData.length - 1 ||
                idx % 4 === 0 ||
                hasRain;

              return (
                <div key={item.key} className="flex-1 min-w-0 text-center select-none">
                  {/* Desktop Label */}
                  <div className="hidden sm:block">
                    <div
                      className={`text-[10px] font-medium leading-none truncate ${
                        isHovered
                          ? 'text-slate-900 dark:text-white font-bold'
                          : hasRain
                          ? 'text-slate-800 dark:text-slate-200 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none truncate">
                      {item.subLabel}
                    </div>
                  </div>

                  {/* Mobile Label */}
                  <div className="sm:hidden">
                    {period === 'months' ? (
                      <div
                        className={`text-[9px] font-medium leading-none truncate ${
                          isHovered ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.label.split('/')[0]}
                      </div>
                    ) : period === '15d' ? (
                      <>
                        <div
                          className={`text-[9px] font-medium leading-none truncate ${
                            hasRain ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {dayNum}
                        </div>
                        <div className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                          {item.subLabel}
                        </div>
                      </>
                    ) : (
                      <div className="h-4 flex items-center justify-center">
                        {showMobileLabel ? (
                          <span
                            className={`text-[8px] font-medium leading-none ${
                              hasRain ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {dayNum}
                          </span>
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
