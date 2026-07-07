import { useState, useMemo } from 'react';
import type { Exercise } from '../../types/exercise';
import { EXERCISE_CATEGORIES, type ExerciseCategory } from '../../types/exercise';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseForm } from './ExerciseForm';
import type { ExerciseFormData } from './ExerciseForm';
import { ConfirmDialog } from '../common/ConfirmDialog';

export interface ExerciseListProps {
  exercises: Exercise[];
  getRecordCount: (exerciseId: string) => number;
  onAdd: (data: ExerciseFormData) => void;
  onEdit: (id: string, data: ExerciseFormData) => void;
  onDelete: (id: string) => void;
}

export function ExerciseList({
  exercises,
  getRecordCount,
  onAdd,
  onEdit,
  onDelete,
}: ExerciseListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(undefined);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const filteredExercises = useMemo(() => {
    if (activeCategory === '全部') return exercises;
    return exercises.filter((e) => e.category === activeCategory);
  }, [exercises, activeCategory]);

  function handleAdd() {
    setEditingExercise(undefined);
    setShowForm(true);
  }

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setShowForm(true);
  }

  function handleFormSubmit(data: ExerciseFormData) {
    if (editingExercise) {
      onEdit(editingExercise.id, data);
    } else {
      onAdd(data);
    }
    setShowForm(false);
    setEditingExercise(undefined);
  }

  function handleDeleteConfirm() {
    if (deletingExercise) {
      onDelete(deletingExercise.id);
      setDeletingExercise(undefined);
    }
  }

  if (exercises.length === 0 && !showForm) {
    return (
      <div>
        <EmptyState
          icon="🏋️"
          title="暂无训练动作"
          description="点击下方按钮添加第一个训练动作"
          action={<Button onClick={handleAdd}>添加动作</Button>}
        />
        <ExerciseForm
          isOpen={showForm}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          训练动作 ({exercises.length})
        </h2>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          + 添加动作
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveCategory('全部')}
          className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer ${
            activeCategory === '全部'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {EXERCISE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              recordCount={getRecordCount(exercise.id)}
              onEdit={handleEdit}
              onDelete={(e) => setDeletingExercise(e)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="该类别暂无动作"
          description="切换类别或添加新动作"
        />
      )}

      {/* Form Modal */}
      <ExerciseForm
        isOpen={showForm}
        initialData={editingExercise}
        defaultCategory={
          activeCategory !== '全部'
            ? (activeCategory as ExerciseCategory)
            : undefined
        }
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingExercise(undefined);
        }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deletingExercise)}
        title="删除训练动作"
        message={
          deletingExercise
            ? `确定要删除"${deletingExercise.name}"吗？${
                getRecordCount(deletingExercise.id) > 0
                  ? `该动作下有 ${getRecordCount(deletingExercise.id)} 条训练记录，删除后这些记录仍会保留。`
                  : ''
              }`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingExercise(undefined)}
      />
    </div>
  );
}
