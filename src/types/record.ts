export interface SetRecord {
  setNumber: number;
  reps: number;
  weight: number;
  rir?: number;    // Reps In Reserve (0-10)
  rpe?: number;    // Rate of Perceived Exertion (1-10)
}

export interface DayExercise {
  exerciseId: string;
  sets: SetRecord[];
  note?: string;
  duration?: number; // 训练时长（分钟）
}

export interface TrainingDay {
  id: string;
  name: string;       // 卡片名称，可自定义，默认 = 日期
  date: string;       // "YYYY-MM-DD"
  exercises: DayExercise[];
  note?: string;
  createdAt: number;
}
