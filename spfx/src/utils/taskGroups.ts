import { IUserTask } from '../models';
import { daysUntil } from './dates';

export type TaskGroupKey = 'overdue' | 'today' | 'upcoming' | 'noDate';
export interface ITaskGroup { key: TaskGroupKey; tasks: IUserTask[] }

const ORDER: TaskGroupKey[] = ['overdue', 'today', 'upcoming', 'noDate'];

export function groupKey(task: IUserTask, now: Date): TaskGroupKey {
  if (!task.dueDate) return 'noDate';
  const d = daysUntil(task.dueDate, now);
  return d < 0 ? 'overdue' : d === 0 ? 'today' : 'upcoming';
}

/** Sorts by due date (undated last), keeps at most `max` tasks, then groups; empty groups are omitted. */
export function groupTasks(tasks: IUserTask[], now: Date, max: number): { groups: ITaskGroup[]; hidden: number } {
  const sorted = tasks.slice().sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  const shown = sorted.slice(0, max);
  const groups = ORDER
    .map((key) => ({ key, tasks: shown.filter((t) => groupKey(t, now) === key) }))
    .filter((g) => g.tasks.length > 0);
  return { groups, hidden: Math.max(0, sorted.length - shown.length) };
}
