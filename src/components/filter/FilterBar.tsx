import { useState, useMemo } from 'react';
import type { Exercise, ExerciseCategory } from '../../types/exercise';
import type { FilterConditions } from '../../types/filter';
import { EXERCISE_CATEGORIES } from '../../types/exercise';
import { Button } from '../common/Button';
import { todayISO, daysAgoISO } from '../../utils/date';

export interface FilterBarProps {
  filters: FilterConditions;
  exercises: Exercise[];
  onChange: (filters: FilterConditions) => void;
  resultCount: number;
}

export function FilterBar({
  filters,
  exercises,
  onChange,
  resultCount,
}: FilterBarProps) {
  function update<K extends keyof FilterConditions>(
    key: K,
    value: FilterConditions[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  function handleReset() {
    onChange({
      startDate: daysAgoISO(30),
      endDate: todayISO(),
      exerciseIds: [],
      category: '',
    });
  }

  function toggleExerciseId(id: string) {
    const newIds = filters.exerciseIds.includes(id)
      ? filters.exerciseIds.filter((x) => x !== id)
      : [...filters.exerciseIds, id];
    update('exerciseIds', newIds);
  }

  const [expanded, setExpanded] = useState(false);
  const [exTab, setExTab] = useState<string>('全部');

  const exercisesByCategory = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const ex of exercises) {
      const list = map.get(ex.category) ?? [];
      list.push(ex);
      map.set(ex.category, list);
    }
    return map;
  }, [exercises]);

  const groupedExercises = useMemo(() => {
    if (exTab === '全部') return exercises;
    return exercisesByCategory.get(exTab) ?? [];
  }, [exercises, exercisesByCategory, exTab]);

  const selectedCount = filters.exerciseIds.length;

  const hasActiveFilters =
    filters.exerciseIds.length > 0 ||
    filters.category !== '' ||
    filters.startDate !== daysAgoISO(30) ||
    filters.endDate !== todayISO();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-600 w-16 shrink-0">日期范围</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update('startDate', e.target.value)}
          className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
        <span className="text-gray-400">至</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update('endDate', e.target.value)}
          className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-600 w-16 shrink-0">动作类别</label>
        <select
          value={filters.category}
          onChange={(e) =>
            update('category', e.target.value as ExerciseCategory | '')
          }
          className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        >
          <option value="">全部</option>
          {EXERCISE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Exercise multi-select */}
      <div className="flex flex-wrap items-start gap-2">
        <label className="text-sm text-gray-600 w-16 shrink-0 pt-1">训练动作</label>
        <div className="flex-1 min-w-0">
          {exercises.length === 0 ? (
            <span className="text-sm text-gray-400">暂无训练动作</span>
          ) : !expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer"
            >
              {selectedCount > 0 ? (
                <span className="text-green-600 font-medium">
                  已选 {selectedCount} 个动作
                </span>
              ) : (
                <span>全部动作</span>
              )}
              <span className="text-xs text-gray-400">
                ({exercises.length}个)
              </span>
              <span className="text-gray-400 ml-1">展开 ▼</span>
            </button>
          ) : (
            <div className="space-y-2">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setExTab('全部')}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors cursor-pointer ${
                    exTab === '全部'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {EXERCISE_CATEGORIES.map((cat) => {
                  const count = exercisesByCategory.get(cat)?.length ?? 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setExTab(cat)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors cursor-pointer ${
                        exTab === cat
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
                <button
                  onClick={() => setExpanded(false)}
                  className="px-2 py-0.5 text-xs rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer ml-auto"
                >
                  收起 ▲
                </button>
              </div>

              {/* Exercise chips for selected category */}
              <div className="flex flex-wrap gap-1.5">
                {groupedExercises.map((ex) => {
                  const selected = filters.exerciseIds.includes(ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => toggleExerciseId(ex.id)}
                      className={`px-2.5 py-1 text-xs rounded-full transition-colors cursor-pointer ${
                        selected
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ex.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          共 <span className="font-semibold text-gray-700">{resultCount}</span> 个训练日
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            重置筛选
          </Button>
        )}
      </div>
    </div>
  );
}
