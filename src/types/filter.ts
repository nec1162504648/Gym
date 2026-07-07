import type { ExerciseCategory } from './exercise';

export interface FilterConditions {
  startDate: string;
  endDate: string;
  exerciseIds: string[];
  category: ExerciseCategory | '';
}
