export const EXERCISE_CATEGORIES = [
  '胸', '背', '腿', '肩', '三头', '二头', '核心', '有氧', '其他',
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description?: string;
  createdAt: number;
}

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  '胸': 'bg-blue-100 text-blue-700',
  '背': 'bg-purple-100 text-purple-700',
  '腿': 'bg-orange-100 text-orange-700',
  '肩': 'bg-yellow-100 text-yellow-700',
  '三头': 'bg-pink-100 text-pink-700',
  '二头': 'bg-rose-100 text-rose-700',
  '核心': 'bg-teal-100 text-teal-700',
  '有氧': 'bg-green-100 text-green-700',
  '其他': 'bg-gray-100 text-gray-600',
};
