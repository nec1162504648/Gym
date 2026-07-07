import { useState, useEffect, useMemo } from 'react';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay, DayExercise, SetRecord } from '../../types/record';
import { EXERCISE_CATEGORIES, CATEGORY_COLORS } from '../../types/exercise';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { todayISO } from '../../utils/date';

export interface TrainingDayFormData {
  name: string;
  date: string;
  exercises: Omit<DayExercise, 'note'>[];
}

export interface TrainingDayFormProps {
  isOpen: boolean;
  exercises: Exercise[];
  initialData?: TrainingDay;
  compact?: boolean;
  onSubmit: (data: TrainingDayFormData) => void;
  onCancel: () => void;
}

interface SetRow {
  key: string;
  reps: string;
  weight: string;
}

function emptySet(): SetRow {
  return { key: crypto.randomUUID(), reps: '', weight: '' };
}

export function TrainingDayForm({
  isOpen,
  exercises,
  initialData,
  compact = false,
  onSubmit,
  onCancel,
}: TrainingDayFormProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [setRows, setSetRows] = useState<Record<string, SetRow[]>>({});
  const [catalogTab, setCatalogTab] = useState<string>('全部');
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDate(initialData.date);
      const ids = initialData.exercises.map((de) => de.exerciseId);
      setSelectedIds(ids);
      const rows: Record<string, SetRow[]> = {};
      for (const de of initialData.exercises) {
        rows[de.exerciseId] = de.sets.map((s) => ({
          key: crypto.randomUUID(),
          reps: String(s.reps),
          weight: String(s.weight),
        }));
      }
      setSetRows(rows);
    } else {
      setName(date);
      setSelectedIds([]);
      setSetRows({});
    }
    setError('');
  }, [initialData, isOpen]);

  // Filtered catalog by category tab
  const filteredCatalog = useMemo(() => {
    if (catalogTab === '全部') return exercises;
    return exercises.filter((e) => e.category === catalogTab);
  }, [exercises, catalogTab]);

  // Already-added exercises
  const addedExercises = useMemo(
    () => exercises.filter((e) => selectedIds.includes(e.id)),
    [exercises, selectedIds]
  );

  // Not-yet-added exercises
  const availableExercises = useMemo(
    () => filteredCatalog.filter((e) => !selectedIds.includes(e.id)),
    [filteredCatalog, selectedIds]
  );

  function handleAddExerciseToDay(exerciseId: string) {
    setSelectedIds([...selectedIds, exerciseId]);
    setSetRows({ ...setRows, [exerciseId]: [emptySet()] });
  }

  function handleRemoveExerciseFromDay(exerciseId: string) {
    setSelectedIds(selectedIds.filter((id) => id !== exerciseId));
    const next = { ...setRows };
    delete next[exerciseId];
    setSetRows(next);
  }

  function handleAddSet(exerciseId: string) {
    setSetRows({
      ...setRows,
      [exerciseId]: [...(setRows[exerciseId] ?? [emptySet()]), emptySet()],
    });
  }

  function handleRemoveSet(exerciseId: string, setIdx: number) {
    const current = setRows[exerciseId];
    if (!current || current.length <= 1) return;
    setSetRows({
      ...setRows,
      [exerciseId]: current.filter((_, i) => i !== setIdx),
    });
  }

  function handleSetChange(
    exerciseId: string,
    setIdx: number,
    field: 'reps' | 'weight',
    value: string
  ) {
    const current = setRows[exerciseId];
    if (!current) return;
    setSetRows({
      ...setRows,
      [exerciseId]: current.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      ),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName && !compact) {
      setError('请输入训练日名称');
      return;
    }
    if (!compact && !date) {
      setError('请选择日期');
      return;
    }

    const dayExercises: Omit<DayExercise, 'note'>[] = [];

    for (const exerciseId of selectedIds) {
      const rows = setRows[exerciseId];
      if (!rows || rows.length === 0) continue;

      const sets: SetRecord[] = [];
      for (let si = 0; si < rows.length; si++) {
        const s = rows[si];
        const reps = Number(s.reps);
        const weight = Number(s.weight);
        if (isNaN(reps) || reps <= 0) {
          const name = exercises.find((e) => e.id === exerciseId)?.name ?? '动作';
          setError(`"${name}" 的第${si + 1}组次数无效`);
          return;
        }
        if (isNaN(weight) || weight < 0) {
          const name = exercises.find((e) => e.id === exerciseId)?.name ?? '动作';
          setError(`"${name}" 的第${si + 1}组重量无效`);
          return;
        }
        sets.push({ reps, weight, setNumber: si + 1 });
      }
      dayExercises.push({ exerciseId, sets });
    }

    onSubmit({
      name: compact ? (initialData?.name ?? trimmedName) : trimmedName,
      date: compact ? (initialData?.date ?? todayISO()) : date,
      exercises: dayExercises,
    });

    setError('');
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={compact ? '编辑训练内容' : isEditing ? '编辑训练日' : '今日训练'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name & Date — hidden in compact mode */}
        {!compact && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                卡片名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="如：练胸日、腿部轰炸日"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div className="w-44 shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                训练日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Added exercises with sets editor */}
        {addedExercises.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              已选动作 ({addedExercises.length})
            </h3>
            <div className="space-y-3">
              {addedExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="border border-green-200 rounded-lg p-3 bg-green-50/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">
                        {ex.name}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[ex.category]}`}
                      >
                        {ex.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseFromDay(ex.id)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Sets */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">组数详情</span>
                      <button
                        type="button"
                        onClick={() => handleAddSet(ex.id)}
                        className="text-xs text-green-600 hover:text-green-700 cursor-pointer"
                      >
                        + 加组
                      </button>
                    </div>
                    {(setRows[ex.id] ?? []).map((s, si) => (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 w-10 shrink-0">
                          第{si + 1}组
                        </span>
                        <input
                          type="number"
                          placeholder="重量"
                          value={s.weight}
                          onChange={(e) =>
                            handleSetChange(ex.id, si, 'weight', e.target.value)
                          }
                          min="0"
                          step="0.5"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-400">kg</span>
                        <input
                          type="number"
                          placeholder="次数"
                          value={s.reps}
                          onChange={(e) =>
                            handleSetChange(ex.id, si, 'reps', e.target.value)
                          }
                          min="1"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-400">次</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(ex.id, si)}
                          disabled={(setRows[ex.id] ?? []).length <= 1}
                          className="p-0.5 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Quick-fill reps buttons */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-xs text-gray-400 mr-1">次数快捷:</span>
                      {[3, 6, 9, 11].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            const current = setRows[ex.id];
                            if (!current) return;
                            setSetRows({
                              ...setRows,
                              [ex.id]: current.map((s) => ({ ...s, reps: String(n) })),
                            });
                          }}
                          className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer text-gray-600"
                        >
                          {n}次
                        </button>
                      ))}
                      <span className="text-gray-200 mx-0.5">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = setRows[ex.id];
                          if (!current) return;
                          setSetRows({
                            ...setRows,
                            [ex.id]: current.map((s) => ({
                              ...s,
                              reps: String(Math.max(1, Number(s.reps || 0) - 1)),
                            })),
                          });
                        }}
                        className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer text-gray-600"
                      >
                        −1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = setRows[ex.id];
                          if (!current) return;
                          setSetRows({
                            ...setRows,
                            [ex.id]: current.map((s) => ({
                              ...s,
                              reps: String(Number(s.reps || 0) + 1),
                            })),
                          });
                        }}
                        className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer text-gray-600"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise catalog */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            动作库 {exercises.length === 0 && '(暂无动作，请先在「训练动作」页添加)'}
          </h3>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => setCatalogTab('全部')}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors cursor-pointer ${
                catalogTab === '全部'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {EXERCISE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatalogTab(cat)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors cursor-pointer ${
                  catalogTab === cat
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exercise chips */}
          {availableExercises.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleAddExerciseToDay(ex.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer text-sm"
                >
                  <span className="text-gray-800">{ex.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[ex.category]}`}>
                    {ex.category}
                  </span>
                  <span className="text-green-500 font-bold ml-1">+</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-lg">
              {exercises.length === 0
                ? '请先在「训练动作」标签页添加动作'
                : catalogTab === '全部'
                  ? '所有动作已添加'
                  : '该类别动作已全部添加'}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onCancel}>
            取消
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? '保存修改' : '保存训练'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
