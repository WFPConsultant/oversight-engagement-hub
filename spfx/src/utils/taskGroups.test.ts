import { IUserTask } from '../models';
import { groupTasks } from './taskGroups';

const now = new Date(2026, 5, 15, 10);
const t = (id: string, due?: Date): IUserTask => ({ id, title: id, source: 'Planner', status: 'notStarted', dueDate: due });

describe('groupTasks', () => {
  const tasks = [t('later', new Date(2026, 5, 20)), t('none'), t('late', new Date(2026, 5, 10)), t('today', new Date(2026, 5, 15, 23))];

  it('groups in overdue, today, upcoming, no-date order and sorts inside groups', () => {
    const { groups } = groupTasks(tasks, now, 10);
    expect(groups.map((g) => g.key)).toEqual(['overdue', 'today', 'upcoming', 'noDate']);
    expect(groups.map((g) => g.tasks[0].id)).toEqual(['late', 'today', 'later', 'none']);
  });

  it('caps the number shown and reports how many were hidden', () => {
    const r = groupTasks(tasks, now, 2);
    expect(r.groups.reduce((n, g) => n + g.tasks.length, 0)).toBe(2);
    expect(r.hidden).toBe(2);
  });
});
