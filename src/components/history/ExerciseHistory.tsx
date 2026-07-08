import { useState, useMemo } from 'react';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay, DayExercise, SetRecord } from '../../types/record';
import { EXERCISE_CATEGORIES } from '../../types/exercise';
import { getExerciseTrend } from '../../utils/stats';
import { formatDate } from '../../utils/date';
import {
  exportExerciseHistoryToCsv,
  type CsvHistoryRow,
} from '../../utils/exportCsv';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export interface ExerciseHistoryProps {
  trainingDays: TrainingDay[];
  exercises: Exercise[];
}

interface HistoryEntry {
  dayId: string;
  date: string;
  dayName: string;
  duration?: number;
  sets: SetRecord[];
  totalVolume: number;
}

function getExerciseById(exercises: Exercise[], id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function ExerciseHistory({ trainingDays, exercises }: ExerciseHistoryProps) {
  // --- Exercise selector ---
  const [selectedId, setSelectedId] = useState<string>(() => {
    // Default to first exercise that has training data
    for (const ex of exercises) {
      const hasData = trainingDays.some((d) =>
        d.exercises.some((de) => de.exerciseId === ex.id && de.sets.length > 0)
      );
      if (hasData) return ex.id;
    }
    return exercises.length > 0 ? exercises[0].id : '';
  });

  const selectedExercise = getExerciseById(exercises, selectedId);

  // --- Derived data ---
  const historyEntries = useMemo((): HistoryEntry[] => {
    if (!selectedId) return [];
    return trainingDays
      .filter((d) =>
        d.exercises.some((de) => de.exerciseId === selectedId && de.sets.length > 0)
      )
      .map((d) => {
        const de = d.exercises.find(
          (de) => de.exerciseId === selectedId && de.sets.length > 0
        ) as DayExercise;
        const totalVolume = de.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        return {
          dayId: d.id,
          date: d.date,
          dayName: d.name,
          duration: de.duration,
          sets: de.sets,
          totalVolume,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [trainingDays, selectedId]);

  const summary = useMemo(() => {
    if (historyEntries.length === 0) return { sessions: 0, maxWeight: 0, maxReps: 0, totalVolume: 0 };
    let maxWeight = 0;
    let maxReps = 0;
    let totalVolume = 0;
    for (const entry of historyEntries) {
      totalVolume += entry.totalVolume;
      for (const s of entry.sets) {
        if (s.weight > maxWeight) maxWeight = s.weight;
        if (s.reps > maxReps) maxReps = s.reps;
      }
    }
    return {
      sessions: historyEntries.length,
      maxWeight,
      maxReps,
      totalVolume,
    };
  }, [historyEntries]);

  const trendData = useMemo(
    () => getExerciseTrend(trainingDays, selectedId),
    [trainingDays, selectedId]
  );

  // Derived trend: average weight per session
  const trendWithAvg = useMemo(() => {
    return trendData.map((p) => ({
      ...p,
      avgWeight: p.totalVolume > 0 && historyEntries.find((h) => h.date === p.date)
        ? Math.round(
            (p.totalVolume /
              historyEntries
                .find((h) => h.date === p.date)!
                .sets.reduce((sum, s) => sum + s.reps, 0)) *
              10
            ) / 10
        : 0,
    }));
  }, [trendData, historyEntries]);

  // Check if any entry has RIR/RPE
  const hasRir = historyEntries.some((e) => e.sets.some((s) => s.rir != null));
  const hasRpe = historyEntries.some((e) => e.sets.some((s) => s.rpe != null));

  // --- CSV export ---
  function handleExportCsv() {
    if (!selectedExercise) return;
    const rows: CsvHistoryRow[] = [];
    for (const entry of historyEntries) {
      for (const s of entry.sets) {
        rows.push({
          date: entry.date,
          dayName: entry.dayName,
          duration: entry.duration != null ? String(entry.duration) : '',
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          rir: s.rir != null ? String(s.rir) : '',
          rpe: s.rpe != null ? String(s.rpe) : '',
          volume: s.weight * s.reps,
        });
      }
    }
    exportExerciseHistoryToCsv(selectedExercise.name, rows);
  }

  // --- Grouped exercises for selector ---
  const exercisesByCategory = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const cat of EXERCISE_CATEGORIES) {
      map.set(cat, []);
    }
    for (const ex of exercises) {
      map.get(ex.category)?.push(ex);
    }
    return map;
  }, [exercises]);

  // --- Empty state ---
  if (trainingDays.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="暂无训练数据"
        description="开始记录训练后，这里可以查看每个动作的历史详情"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== A: Exercise Selector ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 选择训练动作
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {Array.from(exercisesByCategory.entries()).map(
                ([cat, exs]) =>
                  exs.length > 0 && (
                    <optgroup key={cat} label={cat}>
                      {exs.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </optgroup>
                  )
              )}
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={historyEntries.length === 0}
            className="self-end"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出 CSV
          </Button>
        </div>
      </div>

      {!selectedExercise || historyEntries.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="该动作暂无训练记录"
          description="在训练记录中添加该动作的训练数据后，这里会展示历史详情"
        />
      ) : (
        <>
          {/* ===== B: Summary Stats ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '训练次数', value: summary.sessions, unit: '次' },
              { label: '最大重量', value: summary.maxWeight, unit: 'kg' },
              { label: '最高次数', value: summary.maxReps, unit: '次' },
              { label: '总训练容量', value: summary.totalVolume.toLocaleString(), unit: 'kg' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center"
              >
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {typeof stat.value === 'number' && stat.value < 10000
                    ? stat.value
                    : stat.value}
                </p>
                <p className="text-xs text-gray-400">{stat.unit}</p>
              </div>
            ))}
          </div>

          {/* ===== C: Weight Trend Chart ===== */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              📈 {selectedExercise.name} 重量趋势
            </h2>
            {trendWithAvg.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">暂无趋势数据</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendWithAvg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    label={{
                      value: '重量(kg)',
                      position: 'insideLeft',
                      style: { fontSize: 11, fill: '#9ca3af' },
                      angle: -90,
                      dy: 50,
                    }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    labelFormatter={(v) => formatDate(String(v))}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="最大重量"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgWeight"
                    name="平均重量"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* ===== D: History List ===== */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              📋 训练历史（{historyEntries.length} 次）
            </h2>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">日期</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">训练日</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">时长</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">组号</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">重量(kg)</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">次数</th>
                    {hasRir && <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">RIR</th>}
                    {hasRpe && <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">RPE</th>}
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">容量</th>
                  </tr>
                </thead>
                <tbody>
                  {historyEntries.map((entry) =>
                    entry.sets.map((s, si) => (
                      <tr
                        key={`${entry.dayId}-${s.setNumber}`}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        {si === 0 && (
                          <>
                            <td
                              className="py-2 px-3 text-gray-800 font-medium"
                              rowSpan={entry.sets.length}
                            >
                              {entry.date.slice(5)}
                            </td>
                            <td className="py-2 px-3 text-gray-600" rowSpan={entry.sets.length}>
                              {entry.dayName}
                            </td>
                            <td
                              className="py-2 px-3 text-center text-gray-500"
                              rowSpan={entry.sets.length}
                            >
                              {entry.duration != null ? `${entry.duration}分钟` : '-'}
                            </td>
                          </>
                        )}
                        <td className="py-2 px-3 text-center text-gray-500">{s.setNumber}</td>
                        <td className="py-2 px-3 text-center text-gray-800 font-mono font-medium">
                          {s.weight}
                        </td>
                        <td className="py-2 px-3 text-center text-gray-800 font-mono">{s.reps}</td>
                        {hasRir && (
                          <td className="py-2 px-3 text-center text-gray-500">
                            {s.rir != null ? s.rir : '-'}
                          </td>
                        )}
                        {hasRpe && (
                          <td className="py-2 px-3 text-center text-gray-500">
                            {s.rpe != null ? s.rpe : '-'}
                          </td>
                        )}
                        <td className="py-2 px-3 text-center text-gray-500 font-mono">
                          {s.weight * s.reps}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {historyEntries.map((entry) => (
                <div
                  key={entry.dayId}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm text-gray-800">
                        {entry.dayName}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {entry.duration != null ? `⏱${entry.duration}分钟` : ''}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {entry.sets.map((s) => (
                      <div
                        key={s.setNumber}
                        className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-400 w-8">#{s.setNumber}</span>
                        <span className="text-gray-800 font-mono font-medium w-14 text-right">
                          {s.weight}kg
                        </span>
                        <span className="text-gray-500 font-mono w-14 text-right">
                          {s.reps}次
                        </span>
                        <span className="text-gray-400 text-[10px] w-20 text-right">
                          {(hasRir || hasRpe) && (
                            <>
                              {s.rir != null ? `RIR:${s.rir}` : ''}
                              {s.rpe != null ? ` RPE:${s.rpe}` : ''}
                            </>
                          )}
                        </span>
                        <span className="text-gray-400 font-mono w-14 text-right">
                          {s.weight * s.reps}kg
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {entry.sets.length}组
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      总容量: {entry.totalVolume.toLocaleString()}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
