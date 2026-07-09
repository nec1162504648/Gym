import { useState, useCallback, useMemo } from 'react';
import type { TrainingDay } from '../types/record';
import type { FilterConditions } from '../types/filter';
import type { ExerciseCategory } from '../types/exercise';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { generateId } from '../utils/id';
import { filterTrainingDays, filterByCategory } from '../utils/filter';
import { todayISO } from '../utils/date';

const STORAGE_KEY = 'gym_training_days';

export interface UseTrainingDaysOptions {
  exercises: { id: string; category: ExerciseCategory }[];
}

export interface UseTrainingDaysReturn {
  trainingDays: TrainingDay[];
  addTrainingDay: (date?: string) => TrainingDay;
  updateTrainingDay: (id: string, updates: Partial<Pick<TrainingDay, 'name' | 'date' | 'exercises' | 'note'>>) => void;
  deleteTrainingDay: (id: string) => void;
  getFilteredTrainingDays: (filters: FilterConditions) => TrainingDay[];
  getDayCountByExercise: (exerciseId: string) => number;
  setTrainingDays: (data: TrainingDay[]) => void;
}

export function useTrainingDays({ exercises }: UseTrainingDaysOptions): UseTrainingDaysReturn {
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>(() =>
    loadFromStorage<TrainingDay[]>(STORAGE_KEY, [])
  );

  const persist = useCallback((data: TrainingDay[]) => {
    setTrainingDays(data);
    saveToStorage(STORAGE_KEY, data);
  }, []);

  const addTrainingDay = useCallback(
    (date?: string): TrainingDay => {
      const dateStr = date ?? todayISO();
      const newDay: TrainingDay = {
        id: generateId(),
        name: dateStr,
        date: dateStr,
        exercises: [],
        note: undefined,
        createdAt: Date.now(),
      };
      persist([...trainingDays, newDay]);
      return newDay;
    },
    [trainingDays, persist]
  );

  const updateTrainingDay = useCallback(
    (
      id: string,
      updates: Partial<Pick<TrainingDay, 'name' | 'date' | 'exercises' | 'note'>>
    ) => {
      persist(
        trainingDays.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    },
    [trainingDays, persist]
  );

  const deleteTrainingDay = useCallback(
    (id: string) => {
      persist(trainingDays.filter((d) => d.id !== id));
    },
    [trainingDays, persist]
  );

  const exerciseCategoryMap = useMemo(() => {
    const map = new Map<string, ExerciseCategory>();
    for (const ex of exercises) {
      map.set(ex.id, ex.category);
    }
    return map;
  }, [exercises]);

  const getFilteredTrainingDays = useCallback(
    (filters: FilterConditions): TrainingDay[] => {
      let result = filterTrainingDays(trainingDays, filters);
      if (filters.category) {
        result = filterByCategory(result, filters.category, exerciseCategoryMap);
      }
      return result.sort((a, b) => b.date.localeCompare(a.date));
    },
    [trainingDays, exerciseCategoryMap]
  );

  const getDayCountByExercise = useCallback(
    (exerciseId: string): number =>
      trainingDays.filter((d) =>
        d.exercises.some((de) => de.exerciseId === exerciseId)
      ).length,
    [trainingDays]
  );

  return {
    trainingDays,
    addTrainingDay,
    updateTrainingDay,
    deleteTrainingDay,
    getFilteredTrainingDays,
    getDayCountByExercise,
    setTrainingDays: persist,
  };
}
