export interface SetRecord {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface DayExercise {
  exerciseId: string;
  sets: SetRecord[];
  note?: string;
}

export interface TrainingDay {
  id: string;
  name: string;       // 卡片名称，可自定义，默认 = 日期
  date: string;       // "YYYY-MM-DD"
  exercises: DayExercise[];
  note?: string;
  createdAt: number;
}
