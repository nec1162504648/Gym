import { useState, useMemo } from 'react';
import type { Exercise, ExerciseCategory } from '../../types/exercise';
import type { TrainingDay } from '../../types/record';
import {
  getVolumeByWeek,
  getVolumeByMonth,
  getPersonalRecords,
} from '../../utils/stats';
import { EmptyState } from '../common/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export interface TrainingStatsProps {
  trainingDays: TrainingDay[];
  exercises: Exercise[];
}

export function TrainingStats({ trainingDays, exercises }: TrainingStatsProps) {
  const [volumeMode, setVolumeMode] = useState<'week' | 'month'>('week');

  const volumeByWeek = useMemo(
    () => getVolumeByWeek(trainingDays),
    [trainingDays]
  );

  const volumeByMonth = useMemo(
    () => getVolumeByMonth(trainingDays),
    [trainingDays]
  );

  const volumeActive = volumeMode === 'week' ? volumeByWeek : volumeByMonth;

  // Build exerciseId → category lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, ExerciseCategory>();
    for (const ex of exercises) {
      map.set(ex.id, ex.category);
    }
    return map;
  }, [exercises]);

  // Build date → Set<category> for heatmap coloring
  const categoryDates = useMemo(() => {
    const map = new Map<string, Set<ExerciseCategory>>();
    for (const day of trainingDays) {
      const cats = new Set<ExerciseCategory>();
      for (const de of day.exercises) {
        const cat = categoryMap.get(de.exerciseId);
        if (cat) cats.add(cat);
      }
      if (cats.size > 0) {
        map.set(day.date, cats);
      }
    }
    return map;
  }, [trainingDays, categoryMap]);

  const personalRecords = useMemo(
    () => getPersonalRecords(trainingDays, exercises),
    [trainingDays, exercises]
  );

  // Filter to only show PRs for exercises that exist (haven't been deleted)
  const existingRecords = personalRecords.filter((pr) =>
    exercises.some((e) => e.id === pr.exerciseId)
  );

  if (trainingDays.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="暂无训练数据"
        description="开始记录训练后，这里会展示统计图表"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== Module 1: Training Frequency ===== */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          🔥 训练频率
        </h2>
        <FrequencyGrid categoryDates={categoryDates} />
      </section>

      {/* ===== Module 2: Training Volume ===== */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            📊 训练容量
          </h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setVolumeMode('week')}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                volumeMode === 'week'
                  ? 'bg-white shadow text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              按周
            </button>
            <button
              onClick={() => setVolumeMode('month')}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                volumeMode === 'month'
                  ? 'bg-white shadow text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              按月
            </button>
          </div>
        </div>

        {volumeActive.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">暂无数据</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeActive}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                label={{ value: '总容量(kg)', position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' }, angle: -90, dy: 50 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value) => [`${Number(value).toLocaleString()} kg`, '总容量']}
              />
              <Bar
                dataKey="volume"
                name="总容量"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* ===== Module 3: Personal Records ===== */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          🏆 个人纪录
        </h2>
        {existingRecords.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">暂无纪录</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {existingRecords.map((pr) => (
              <div
                key={pr.exerciseId}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-800">
                    {pr.exerciseName}
                  </span>
                  <span className="text-xs text-gray-400">{pr.exerciseCategory}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 rounded-lg p-2">
                    <span className="text-gray-500">最大重量</span>
                    <p className="font-bold text-green-700 text-base">
                      {pr.maxWeight}kg
                    </p>
                    <span className="text-gray-400">×{pr.maxWeightReps}次</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <span className="text-gray-500">最高次数</span>
                    <p className="font-bold text-blue-700 text-base">
                      {pr.maxReps}次
                    </p>
                    <span className="text-gray-400">{pr.maxRepsWeight}kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------- Frequency Grid sub-component -------- */

interface FrequencyGridProps {
  categoryDates: Map<string, Set<string>>; // date → categories trained
}

function getTileColor(cats: Set<string> | undefined): string {
  if (!cats || cats.size === 0) return 'bg-gray-200';
  const hasChest = cats.has('胸');
  const hasBack = cats.has('背');
  const hasLegs = cats.has('腿');

  if (hasChest && hasBack) return 'bg-purple-500';
  if (hasChest) return 'bg-pink-400';
  if (hasBack) return 'bg-sky-300';
  if (hasLegs) return 'bg-gray-800';
  return 'bg-gray-200'; // other categories or none
}

function getTileLabel(cats: Set<string> | undefined): string {
  if (!cats || cats.size === 0) return '休息';
  const parts: string[] = [];
  if (cats.has('胸')) parts.push('胸');
  if (cats.has('背')) parts.push('背');
  if (cats.has('腿')) parts.push('腿');
  if (parts.length === 0) return '其他训练';
  return parts.join('+');
}

const DAY_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];

function FrequencyGrid({ categoryDates }: FrequencyGridProps) {
  const [freqMode, setFreqMode] = useState<'week' | 'month'>('week');
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // -- Week data --
  const weekDays = useMemo(() => {
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days: { date: string; dayNum: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        date: d.toISOString().slice(0, 10),
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [todayStr]);

  // -- Month data --
  const monthGrid = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const adjustedStart = startDow === 0 ? 6 : startDow - 1; // Mon=0

    const cells: { date: string; dayNum: number; inMonth: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < adjustedStart; i++) {
      cells.push({ date: '', dayNum: 0, inMonth: false });
    }
    // Month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ date: dateStr, dayNum: d, inMonth: true });
    }

    // Chunk into weeks
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [todayStr]);

  // -- Stats for current view --
  const stats = useMemo(() => {
    const daysToCheck = freqMode === 'week' ? weekDays : monthGrid.flat().filter((c) => c.inMonth);
    let chest = 0;
    let back = 0;
    let legs = 0;
    let totalTrained = 0;
    for (const cell of daysToCheck) {
      const cats = categoryDates.get(cell.date);
      if (cats && cats.size > 0) {
        totalTrained++;
        if (cats.has('胸')) chest++;
        if (cats.has('背')) back++;
        if (cats.has('腿')) legs++;
      }
    }
    const totalDays = daysToCheck.length;
    return { chest, back, legs, trained: totalTrained, total: totalDays };
  }, [freqMode, weekDays, monthGrid, categoryDates]);

  const isWeek = freqMode === 'week';

  return (
    <div>
      {/* Toggle + Stats row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setFreqMode('week')}
            className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              isWeek ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            按周
          </button>
          <button
            onClick={() => setFreqMode('month')}
            className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              !isWeek ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            按月
          </button>
        </div>

        <div className="text-xs text-gray-500 flex flex-col items-end gap-0.5">
          <span>
            胸训 <span className="font-semibold text-pink-500">{stats.chest}</span> 次
          </span>
          <span>
            背训 <span className="font-semibold text-sky-500">{stats.back}</span> 次
          </span>
          <span>
            腿训 <span className="font-semibold text-gray-800">{stats.legs}</span> 次
          </span>
        </div>
      </div>

      {/* Week View */}
      {isWeek && (
        <div>
          <div className="flex mb-1">
            {DAY_HEADERS.map((name, i) => (
              <div key={i} className="flex-1 text-center text-[11px] text-gray-400">
                {name}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {weekDays.map((day) => {
              const cats = categoryDates.get(day.date);
              const label = getTileLabel(cats);
              const isToday = day.date === todayStr;
              return (
                <div
                  key={day.date}
                  title={`${day.date} ${label}`}
                  className={`flex-1 aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-mono transition-colors ${
                    getTileColor(cats)
                  } ${isToday ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
                >
                  <span className={cats && cats.size > 0 ? 'text-white text-sm font-bold' : 'text-gray-500'}>
                    {day.dayNum}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <Legend />
            <p className="text-xs text-gray-500 font-medium">
              {stats.trained} / {stats.total} 天
            </p>
          </div>
        </div>
      )}

      {/* Month View */}
      {!isWeek && (
        <div>
          <div className="flex mb-1">
            {DAY_HEADERS.map((name, i) => (
              <div key={i} className="flex-1 text-center text-[11px] text-gray-400">
                {name}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {monthGrid.map((week, wi) => (
              <div key={wi} className="flex gap-1">
                {week.map((cell, di) => {
                  if (!cell.inMonth) {
                    return <div key={di} className="flex-1 aspect-square" />;
                  }
                  const cats = categoryDates.get(cell.date);
                  const label = getTileLabel(cats);
                  const isToday = cell.date === todayStr;
                  return (
                    <div
                      key={di}
                      title={`${cell.date} ${label}`}
                      className={`flex-1 aspect-square rounded-md flex items-center justify-center text-xs transition-colors ${
                        getTileColor(cats)
                      } ${isToday ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
                    >
                      <span className={cats && cats.size > 0 ? 'text-white font-bold' : 'text-gray-500'}>
                        {cell.dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <Legend />
            <p className="text-xs text-gray-500 font-medium">
              {stats.trained} / {stats.total} 天
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-gray-400">
      <span className="flex items-center gap-0.5">
        <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" />
        其他
      </span>
      <span className="flex items-center gap-0.5">
        <span className="w-3 h-3 rounded-sm bg-pink-400 inline-block" />
        胸
      </span>
      <span className="flex items-center gap-0.5">
        <span className="w-3 h-3 rounded-sm bg-sky-300 inline-block" />
        背
      </span>
      <span className="flex items-center gap-0.5">
        <span className="w-3 h-3 rounded-sm bg-gray-800 inline-block" />
        腿
      </span>
      <span className="flex items-center gap-0.5">
        <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
        胸+背
      </span>
    </div>
  );
}
