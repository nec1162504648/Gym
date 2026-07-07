import type { Exercise } from '../../types/exercise';
import { CATEGORY_COLORS } from '../../types/exercise';
import { Button } from '../common/Button';

export interface ExerciseCardProps {
  exercise: Exercise;
  recordCount: number;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

export function ExerciseCard({
  exercise,
  recordCount,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">
            {exercise.name}
          </h3>
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 ${CATEGORY_COLORS[exercise.category]}`}
          >
            {exercise.category}
          </span>
          {exercise.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {exercise.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {recordCount > 0
              ? `${recordCount} 条训练记录`
              : '暂无训练记录'}
          </p>
        </div>

        <div className="flex items-center gap-1 ml-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(exercise)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(exercise)}
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
