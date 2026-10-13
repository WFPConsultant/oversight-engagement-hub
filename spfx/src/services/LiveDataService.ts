import { BaseComponentContext } from '@microsoft/sp-component-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IEngagement, IPerson, IRecommendation, IUserTask } from '../models';
import { IDataService } from './IDataService';

export const LIST_ENGAGEMENTS = 'Engagements';
export const LIST_RECOMMENDATIONS = 'Recommendations';
/** One request, below the 5,000 list-view threshold. Larger lists need paging (documented limitation). */
const MAX_ITEMS = 2000;

const toPerson = (u?: { Title?: string; EMail?: string }): IPerson => ({
  displayName: u?.Title ?? 'Unassigned',
  email: u?.EMail ?? ''
});
const toDate = (s?: string): Date | undefined => (s ? new Date(s) : undefined);

/**
 * Live implementation: SharePoint REST through PnPjs (lists on the current site) and Microsoft Graph
 * (the signed-in user's Planner and To Do tasks).
 * STATUS: not tested against a live tenant.
 */
export class LiveDataService implements IDataService {
  private readonly sp: SPFI;

  constructor(private readonly context: BaseComponentContext) {
    this.sp = spfi().using(SPFx(context));
  }

  public async getEngagements(): Promise<IEngagement[]> {
    const items = await this.sp.web.lists
      .getByTitle(LIST_ENGAGEMENTS)
      .items.select(
        'Id', 'Title', 'EOOEngagementRef', 'EOOEngagementType', 'EOOEngagementStatus', 'EOORiskRating',
        'EOOStartDate', 'EOODueDate', 'EOOBudgetDays', 'EOOConfidentiality', 'EOOLead/Title', 'EOOLead/EMail'
      )
      .expand('EOOLead')
      .top(MAX_ITEMS)();

    const base = this.context.pageContext.web.absoluteUrl;
    return items.map((i) => ({
      id: i.Id,
      ref: i.EOOEngagementRef,
      title: i.Title,
      type: i.EOOEngagementType,
      status: i.EOOEngagementStatus,
      riskRating: i.EOORiskRating,
      lead: toPerson(i.EOOLead),
      startDate: toDate(i.EOOStartDate),
      dueDate: new Date(i.EOODueDate),
      budgetDays: i.EOOBudgetDays ?? undefined,
      confidentiality: i.EOOConfidentiality,
      url: `${base}/Lists/${LIST_ENGAGEMENTS}/DispForm.aspx?ID=${i.Id}`
    }));
  }

  public async getRecommendations(): Promise<IRecommendation[]> {
    const engagements = await this.getEngagements();
    const refById = new Map(engagements.map((e) => [e.id, e.ref]));
    const items = await this.sp.web.lists
      .getByTitle(LIST_RECOMMENDATIONS)
      .items.select(
        'Id', 'Title', 'EOORecommendationRef', 'EOOPriority', 'EOORecommendationStatus', 'EOOTargetDate',
        'EOOImplementedDate', 'EOOManagementResponse', 'EOOEngagement/Id', 'EOOOwner/Title', 'EOOOwner/EMail'
      )
      .expand('EOOEngagement', 'EOOOwner')
      .top(MAX_ITEMS)();

    const base = this.context.pageContext.web.absoluteUrl;
    return items.map((i) => ({
      id: i.Id,
      ref: i.EOORecommendationRef,
      title: i.Title,
      engagementId: i.EOOEngagement?.Id,
      engagementRef: refById.get(i.EOOEngagement?.Id) ?? '',
      priority: i.EOOPriority,
      status: i.EOORecommendationStatus,
      owner: toPerson(i.EOOOwner),
      targetDate: new Date(i.EOOTargetDate),
      implementedDate: toDate(i.EOOImplementedDate),
      managementResponse: i.EOOManagementResponse ?? undefined,
      url: `${base}/Lists/${LIST_RECOMMENDATIONS}/DispForm.aspx?ID=${i.Id}`
    }));
  }

  /** Open Planner tasks assigned to me + open To Do tasks. Needs Graph scopes Tasks.Read (delegated). */
  public async getMyTasks(): Promise<IUserTask[]> {
    const graph = await this.context.msGraphClientFactory.getClient('3');
    const tasks: IUserTask[] = [];

    const planner = await graph.api('/me/planner/tasks').select('id,title,dueDateTime,percentComplete').get();
    for (const t of planner.value ?? []) {
      if (t.percentComplete >= 100) continue;
      tasks.push({
        id: `planner-${t.id}`,
        title: t.title,
        source: 'Planner',
        status: t.percentComplete > 0 ? 'inProgress' : 'notStarted',
        dueDate: toDate(t.dueDateTime),
        webUrl: 'https://tasks.office.com'
      });
    }

    const lists = await graph.api('/me/todo/lists').select('id').get();
    for (const l of lists.value ?? []) {
      const todo = await graph
        .api(`/me/todo/lists/${l.id}/tasks`)
        .filter("status ne 'completed'")
        .select('id,title,status,dueDateTime')
        .get();
      for (const t of todo.value ?? []) {
        tasks.push({
          id: `todo-${t.id}`,
          title: t.title,
          source: 'To Do',
          status: t.status === 'inProgress' ? 'inProgress' : 'notStarted',
          dueDate: toDate(t.dueDateTime?.dateTime),
          webUrl: 'https://to-do.office.com'
        });
      }
    }
    return tasks;
  }
}
