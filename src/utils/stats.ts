import type { TrainingDay } from '../types/record';

/** Single data point for exercise trend chart */
export interface TrendPoint {
  date: string;       // "YYYY-MM-DD"
  maxWeight: number;  // heaviest set that day
  maxReps: number;    // most reps in any set that day
  totalVolume: number; // sum(w × r) for that exercise that day
}

/** Volume grouped by period */
export interface VolumeDatum {
  period: string;     // "2026-W27" or "2026-07"
  label: string;      // "7月" or "第27周"
  volume: number;
  daysTrained: number;
}

/** Personal record */
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  maxWeight: number;
  maxWeightReps: number;
  maxReps: number;
  maxRepsWeight: number;
}

/** Calculate trend data for a specific exercise */
export function getExerciseTrend(
  trainingDays: TrainingDay[],
  exerciseId: string
): TrendPoint[] {
  const points: TrendPoint[] = [];

  for (const day of trainingDays) {
    for (const de of day.exercises) {
      if (de.exerciseId !== exerciseId || de.sets.length === 0) continue;

      let maxWeight = 0;
      let maxReps = 0;
      let totalVolume = 0;

      for (const s of de.sets) {
        if (s.weight > maxWeight) maxWeight = s.weight;
        if (s.reps > maxReps) maxReps = s.reps;
        totalVolume += s.weight * s.reps;
      }

      points.push({ date: day.date, maxWeight, maxReps, totalVolume });
      break;
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

/** Calculate training volume grouped by week */
export function getVolumeByWeek(
  trainingDays: TrainingDay[]
): VolumeDatum[] {
  const map = new Map<string, { volume: number; days: Set<string> }>();

  for (const day of trainingDays) {
    const d = new Date(day.date + 'T00:00:00');
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7
    );
    const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

    let entry = map.get(key);
    if (!entry) {
      entry = { volume: 0, days: new Set() };
      map.set(key, entry);
    }

    for (const de of day.exercises) {
      for (const s of de.sets) {
        entry.volume += s.weight * s.reps;
      }
    }
    entry.days.add(day.date);
  }

  return Array.from(map.entries())
    .map(([period, data]) => {
      const weekPart = period.split('-W')[1];
      return {
        period,
        label: weekPart ? `第${weekPart}周` : period,
        volume: data.volume,
        daysTrained: data.days.size,
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
}

/** Calculate training volume grouped by month */
export function getVolumeByMonth(
  trainingDays: TrainingDay[]
): VolumeDatum[] {
  const map = new Map<string, { volume: number; days: Set<string> }>();

  for (const day of trainingDays) {
    const key = day.date.slice(0, 7);

    let entry = map.get(key);
    if (!entry) {
      entry = { volume: 0, days: new Set() };
      map.set(key, entry);
    }

    for (const de of day.exercises) {
      for (const s of de.sets) {
        entry.volume += s.weight * s.reps;
      }
    }
    entry.days.add(day.date);
  }

  return Array.from(map.entries())
    .map(([period, data]) => {
      const monthNum = parseInt(period.split('-')[1], 10);
      return {
        period,
        label: `${monthNum}月`,
        volume: data.volume,
        daysTrained: data.days.size,
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
}

/** Get training dates for heatmap (last N months) */
export function getTrainingDates(
  trainingDays: TrainingDay[],
  monthsBack = 6
): { dates: Set<string>; startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - monthsBack);
  start.setDate(1);

  const dates = new Set(trainingDays.map((d) => d.date));
  return {
    dates,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

/** Calculate personal records for all exercises */
export function getPersonalRecords(
  trainingDays: TrainingDay[],
  exercises: { id: string; name: string; category: string }[]
): PersonalRecord[] {
  const map = new Map<string, PersonalRecord>();

  for (const ex of exercises) {
    map.set(ex.id, {
      exerciseId: ex.id,
      exerciseName: ex.name,
      exerciseCategory: ex.category,
      maxWeight: 0,
      maxWeightReps: 0,
      maxReps: 0,
      maxRepsWeight: 0,
    });
  }

  for (const day of trainingDays) {
    for (const de of day.exercises) {
      const pr = map.get(de.exerciseId);
      if (!pr) continue;

      for (const s of de.sets) {
        if (s.weight > pr.maxWeight) {
          pr.maxWeight = s.weight;
          pr.maxWeightReps = s.reps;
        } else if (s.weight === pr.maxWeight && s.reps > pr.maxWeightReps) {
          pr.maxWeightReps = s.reps;
        }

        if (s.reps > pr.maxReps) {
          pr.maxReps = s.reps;
          pr.maxRepsWeight = s.weight;
        } else if (s.reps === pr.maxReps && s.weight > pr.maxRepsWeight) {
          pr.maxRepsWeight = s.weight;
        }
      }
    }
  }

  return Array.from(map.values()).filter((pr) => pr.maxWeight > 0 || pr.maxReps > 0);
}
