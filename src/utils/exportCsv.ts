/** A single row in the exercise history CSV export */
export interface CsvHistoryRow {
  date: string;
  dayName: string;
  duration: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: string;
  rpe: string;
  volume: number;
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportExerciseHistoryToCsv(
  exerciseName: string,
  rows: CsvHistoryRow[]
): void {
  const headers = [
    '日期',
    '训练日名称',
    '时长(分钟)',
    '组号',
    '重量(kg)',
    '次数',
    'RIR',
    'RPE',
    '容量(kg)',
  ];

  // BOM for Excel UTF-8 Chinese support
  const BOM = '﻿';
  const headerLine = headers.map(escapeCsv).join(',');
  const dataLines = rows.map((r) =>
    [
      r.date,
      r.dayName,
      r.duration,
      r.setNumber,
      r.weight,
      r.reps,
      r.rir,
      r.rpe,
      r.volume,
    ]
      .map(escapeCsv)
      .join(',')
  );

  const csv = BOM + headerLine + '\n' + dataLines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = exerciseName.replace(/[\\/:*?"<>|]/g, '_');
  a.download = `${safeName}-训练历史-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
