export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekday}`;
}

export function groupByDate<T extends { date: string }>(
  items: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  for (const item of sorted) {
    const existing = map.get(item.date);
    if (existing) {
      existing.push(item);
    } else {
      map.set(item.date, [item]);
    }
  }
  return map;
}
