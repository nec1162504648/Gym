import type { TrainingDay } from '../types/record';
import type { FilterConditions } from '../types/filter';

export function filterTrainingDays(
  days: TrainingDay[],
  filters: FilterConditions
): TrainingDay[] {
  return days.filter((day) => {
    // Date range
    if (filters.startDate && day.date < filters.startDate) return false;
    if (filters.endDate && day.date > filters.endDate) return false;

    // Exercise filter — day must contain at least one matching exercise
    if (filters.exerciseIds.length > 0) {
      const hasMatch = day.exercises.some((de) =>
        filters.exerciseIds.includes(de.exerciseId)
      );
      if (!hasMatch) return false;
    }

    return true;
  });
}

export function filterByCategory(
  days: TrainingDay[],
  category: string,
  exerciseCategoryMap: Map<string, string>
): TrainingDay[] {
  if (!category) return days;
  return days.filter((day) =>
    day.exercises.some(
      (de) => exerciseCategoryMap.get(de.exerciseId) === category
    )
  );
}
