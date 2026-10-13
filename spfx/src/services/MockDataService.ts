import {
  IEngagement, IPerson, IRecommendation, IUserTask
} from '../models';
import { addDays, startOfDay } from '../utils/dates';
import { IDataService } from './IDataService';
import engagementsJson from './mock/data/engagements.json';
import recommendationsJson from './mock/data/recommendations.json';
import tasksJson from './mock/data/tasks.json';
import usersJson from './mock/data/users.json';

/** Shape of /sample-data files: dates are day offsets from 'today'. */
type Offsets = { startOffsetDays: number; dueOffsetDays: number; targetOffsetDays: number; implementedOffsetDays?: number };
interface ISampleEngagement extends Omit<IEngagement, 'lead' | 'startDate' | 'dueDate'>, Pick<Offsets, 'startOffsetDays' | 'dueOffsetDays'> { leadEmail: string }
interface ISampleRecommendation extends Omit<IRecommendation, 'owner' | 'targetDate' | 'implementedDate'>, Pick<Offsets, 'targetOffsetDays' | 'implementedOffsetDays'> { ownerEmail: string }
interface ISampleTask extends Omit<IUserTask, 'dueDate'> { dueOffsetDays: number }

/**
 * Demo/test implementation. Sample data stores dates as day offsets from "today" so the demo
 * always contains overdue and upcoming items. `now` and `latencyMs` are injectable for tests.
 */
export class MockDataService implements IDataService {
  constructor(
    private readonly now: () => Date = () => new Date(),
    private readonly latencyMs: number = 250
  ) {}

  public getEngagements(): Promise<IEngagement[]> {
    const today = startOfDay(this.now());
    return this.respond(() =>
      (engagementsJson as unknown as ISampleEngagement[]).map((e) => ({
        id: e.id,
        ref: e.ref,
        title: e.title,
        type: e.type,
        status: e.status,
        riskRating: e.riskRating,
        lead: this.person(e.leadEmail),
        startDate: addDays(today, e.startOffsetDays),
        dueDate: addDays(today, e.dueOffsetDays),
        budgetDays: e.budgetDays,
        confidentiality: e.confidentiality
      }))
    );
  }

  public getRecommendations(): Promise<IRecommendation[]> {
    const today = startOfDay(this.now());
    return this.respond(() =>
      (recommendationsJson as unknown as ISampleRecommendation[]).map((r) => ({
        id: r.id,
        ref: r.ref,
        title: r.title,
        engagementId: r.engagementId,
        engagementRef: r.engagementRef,
        priority: r.priority,
        status: r.status,
        owner: this.person(r.ownerEmail),
        targetDate: addDays(today, r.targetOffsetDays),
        implementedDate: r.implementedOffsetDays === undefined ? undefined : addDays(today, r.implementedOffsetDays)
      }))
    );
  }

  public getMyTasks(): Promise<IUserTask[]> {
    const today = startOfDay(this.now());
    return this.respond(() =>
      (tasksJson as unknown as ISampleTask[]).map((t) => ({
        id: t.id,
        title: t.title,
        source: t.source,
        status: t.status,
        dueDate: addDays(today, t.dueOffsetDays),
        webUrl: t.webUrl,
        engagementRef: t.engagementRef
      }))
    );
  }

  private person(email: string): IPerson {
    const u = (usersJson as IPerson[]).find((x) => x.email === email);
    return u ? { ...u } : { displayName: email, email };
  }

  private respond<T>(produce: () => T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(produce()), this.latencyMs));
  }
}
