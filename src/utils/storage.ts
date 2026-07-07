import type { Exercise } from '../types/exercise';
import type { TrainingDay } from '../types/record';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.error(`Failed to parse localStorage key "${key}"`);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage key "${key}"`, e);
  }
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  exercises: Exercise[];
  trainingDays: TrainingDay[];
}

export function exportToJsonFile(
  exercises: Exercise[],
  trainingDays: TrainingDay[]
): void {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    trainingDays,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJsonFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (
          !Array.isArray(data.exercises) ||
          !Array.isArray(data.trainingDays)
        ) {
          throw new Error('Invalid backup file format');
        }
        resolve(data as ExportData);
      } catch {
        reject(new Error('文件格式错误，无法导入'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
