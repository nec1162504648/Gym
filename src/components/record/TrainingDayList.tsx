import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay } from '../../types/record';
import type { TrainingDayFormData } from './TrainingDayForm';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TrainingDayCard } from './TrainingDayCard';
import { TrainingDayForm } from './TrainingDayForm';
import { formatDate } from '../../utils/date';

export interface TrainingDayListProps {
  trainingDays: TrainingDay[];
  exercises: Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
  onAdd: (date?: string) => TrainingDay;
  onUpdate: (id: string, data: TrainingDayFormData) => void;
  onRename: (id: string, name: string) => void;
  onNoteChange: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}

export function TrainingDayList({
  trainingDays,
  exercises,
  getExerciseById,
  onAdd,
  onUpdate,
  onRename,
  onNoteChange,
  onDelete,
}: TrainingDayListProps) {
  const [editingDay, setEditingDay] = useState<TrainingDay | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deletingDay, setDeletingDay] = useState<TrainingDay | undefined>(undefined);

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

  function getExerciseName(id: string): string {
    return getExerciseById(id)?.name ?? '未知动作';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">训练记录</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            共 {trainingDays.length} 个训练日
          </p>
        </div>
        <Button variant="primary" onClick={handleAddToday}>
          + 添加今日训练
        </Button>
      </div>

      {/* Training day cards */}
      {trainingDays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingDays.map((day) => (
            <TrainingDayCard
              key={day.id}
              day={day}
              getExerciseName={getExerciseName}
              onEditExercises={handleEdit}
              onDelete={(d) => setDeletingDay(d)}
              onRename={onRename}
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
            <Button variant="primary" onClick={handleAddToday}>
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
    </div>
  );
}
