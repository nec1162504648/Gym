import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay } from '../../types/record';
import type { TrainingDayFormData } from './TrainingDayForm';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { TrainingDayCard } from './TrainingDayCard';
import { TrainingDayForm } from './TrainingDayForm';
import { formatDate } from '../../utils/date';

export interface TrainingDayListProps {
  trainingDays: TrainingDay[];
  allDays: TrainingDay[];
  exercises: Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
  onAdd: (date?: string) => TrainingDay;
  onUpdate: (id: string, data: TrainingDayFormData) => void;
  onRename: (id: string, name: string) => void;
  onDateChange: (id: string, date: string) => void;
  onNoteChange: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}

export function TrainingDayList({
  trainingDays,
  allDays,
  exercises,
  getExerciseById,
  onAdd,
  onUpdate,
  onRename,
  onDateChange,
  onNoteChange,
  onDelete,
}: TrainingDayListProps) {
  const [editingDay, setEditingDay] = useState<TrainingDay | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deletingDay, setDeletingDay] = useState<TrainingDay | undefined>(undefined);
  const [showCopyPicker, setShowCopyPicker] = useState(false);

  // Days with exercises, sorted by date desc, for the copy picker
  const copyableDays = allDays
    .filter((d) => d.exercises.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  function handleAddToday() {
    onAdd(); // directly creates card, no modal
  }

  function handleEdit(day: TrainingDay) {
    setEditingDay(day);
    setShowForm(true);
  }

  function handleFormSubmit(data: TrainingDayFormData) {
    if (editingDay) {
      onUpdate(editingDay.id, {
        ...data,
        exercises: data.exercises.map((de) => ({
          ...de,
          sets: de.sets.map((s, si) => ({ ...s, setNumber: si + 1 })),
        })),
      });
    }
    setShowForm(false);
    setEditingDay(undefined);
  }

  function handleDeleteConfirm() {
    if (deletingDay) {
      onDelete(deletingDay.id);
      setDeletingDay(undefined);
    }
  }

  function handleCopyFrom(sourceDay: TrainingDay) {
    const newDay = onAdd();
    // Open form pre-filled with source day's exercises, user can modify before saving
    setEditingDay({
      ...newDay,
      exercises: sourceDay.exercises,
      name: sourceDay.name,
    });
    setShowForm(true);
    setShowCopyPicker(false);
  }

  function getExerciseName(id: string): string {
    return getExerciseById(id)?.name ?? '未知动作';
  }

  function getExerciseCategory(id: string): string {
    return getExerciseById(id)?.category ?? '其他';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">训练记录</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            共 {trainingDays.length} 天
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowCopyPicker(true)}
            disabled={copyableDays.length === 0}
          >
            复制
          </Button>
          <Button variant="primary" size="lg" onClick={handleAddToday}>
            + 今日训练
          </Button>
        </div>
      </div>

      {/* Training day cards */}
      {trainingDays.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {trainingDays.map((day) => (
            <TrainingDayCard
              key={day.id}
              day={day}
              getExerciseName={getExerciseName}
              getExerciseCategory={getExerciseCategory}
              onEditExercises={handleEdit}
              onDelete={(d) => setDeletingDay(d)}
              onRename={onRename}
              onDateChange={onDateChange}
              onNoteChange={onNoteChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📊"
          title="暂无训练记录"
          description="点击「添加今日训练」开始记录你的训练"
          action={
            <Button variant="primary" size="lg" onClick={handleAddToday}>
              添加今日训练
            </Button>
          }
        />
      )}

      {/* Form Modal */}
      <TrainingDayForm
        isOpen={showForm}
        exercises={exercises}
        initialData={editingDay}
        compact
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDay(undefined);
        }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deletingDay)}
        title="删除训练日"
        message={
          deletingDay
            ? `确定要删除"${deletingDay.name}"（${formatDate(deletingDay.date)}）吗？此操作不可恢复。`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDay(undefined)}
      />

      {/* Copy Picker Modal */}
      <Modal
        isOpen={showCopyPicker}
        onClose={() => setShowCopyPicker(false)}
        title="选择要复制的训练日"
      >
        {copyableDays.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            暂无可复制的训练日（需要有训练内容的卡片）
          </p>
        ) : (
          <div className="space-y-2">
            {copyableDays.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleCopyFrom(d)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 active:border-green-400 active:bg-green-50 transition-colors cursor-pointer touch-manipulation select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-800">
                    {d.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(d.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {d.exercises.length} 个动作
                  </span>
                  <span className="text-xs text-gray-500">
                    · {d.exercises.reduce((sum, de) => sum + de.sets.length, 0)} 组
                  </span>
                  {(() => {
                    const cats = new Set<string>();
                    for (const de of d.exercises) {
                      cats.add(getExerciseCategory(de.exerciseId));
                    }
                    return (
                      <span className="text-xs text-gray-400">
                        · {Array.from(cats).join('、')}
                      </span>
                    );
                  })()}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <Button variant="secondary" onClick={() => setShowCopyPicker(false)}>
            取消
          </Button>
        </div>
      </Modal>
    </div>
  );
}
