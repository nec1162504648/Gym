import { useState, useCallback } from 'react';
import type { Exercise, ExerciseCategory } from '../types/exercise';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { generateId } from '../utils/id';

const STORAGE_KEY = 'gym_exercises';

export interface UseExercisesReturn {
  exercises: Exercise[];
  addExercise: (name: string, category: ExerciseCategory, description?: string) => void;
  updateExercise: (id: string, updates: Partial<Pick<Exercise, 'name' | 'category' | 'description'>>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  setExercises: (data: Exercise[]) => void;
}

export function useExercises(): UseExercisesReturn {
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    loadFromStorage<Exercise[]>(STORAGE_KEY, [])
  );

  const persist = useCallback((data: Exercise[]) => {
    setExercises(data);
    saveToStorage(STORAGE_KEY, data);
  }, []);

  const addExercise = useCallback(
    (name: string, category: ExerciseCategory, description?: string) => {
      const newExercise: Exercise = {
        id: generateId(),
        name,
        category,
        description,
        createdAt: Date.now(),
      };
      persist([...exercises, newExercise]);
    },
    [exercises, persist]
  );

  const updateExercise = useCallback(
    (
      id: string,
      updates: Partial<Pick<Exercise, 'name' | 'category' | 'description'>>
    ) => {
      persist(
        exercises.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    [exercises, persist]
  );

  const deleteExercise = useCallback(
    (id: string) => {
      persist(exercises.filter((e) => e.id !== id));
    },
    [exercises, persist]
  );

  const getExerciseById = useCallback(
    (id: string): Exercise | undefined =>
      exercises.find((e) => e.id === id),
    [exercises]
  );

  return {
    exercises,
    addExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    setExercises: persist,
  };
}
