import * as React from 'react';
import { Icon, Link, useTheme } from '@fluentui/react';
import { DemoBanner, EmptyState, ErrorState, LoadingState, ThemedRoot } from '../../../components';
import { useAsync } from '../../../hooks/useAsync';
import { format, formatDate } from '../../../utils/format';
import { groupTasks, TaskGroupKey } from '../../../utils/taskGroups';
import { IMyTasksProps } from './IMyTasksProps';

const MyTasksInner: React.FC<IMyTasksProps> = (props) => {
  const { service, strings, locale } = props;
  const theme = useTheme();
  const now = props.now ?? (() => new Date());
  const { data, error, loading, reload } = useAsync(() => service.getMyTasks(), [service]);

  const result = React.useMemo(() => (data ? groupTasks(data, now(), props.maxItems) : undefined), [data, props.maxItems]);
  const heading: Record<TaskGroupKey, string> = {
    overdue: strings.GroupOverdue, today: strings.GroupToday, upcoming: strings.GroupUpcoming, noDate: strings.GroupNoDate
  };

  return (
    <section aria-label={props.title}>
      <h2 style={{ margin: '0 0 8px' }}>{props.title}</h2>
      {props.isDemo && <DemoBanner text={strings.DemoBanner} />}
      {loading && <LoadingState label={strings.Loading} />}
      {error && (
        <ErrorState message={strings.LoadError} detail={`${error.message} ${strings.ConsentHint}`} retryLabel={strings.Retry} onRetry={reload} />
      )}
      {result && (result.groups.length === 0 ? (
        <EmptyState message={strings.Empty} />
      ) : (
        <>
          {result.groups.map((g) => (
            <div key={g.key}>
              <h3 style={{ margin: '12px 0 4px', color: g.key === 'overdue' ? theme.palette.redDark : undefined }}>
                {g.key === 'overdue' && <Icon iconName="Warning" aria-hidden="true" />} {heading[g.key]} ({g.tasks.length})
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {g.tasks.map((t) => (
                  <li key={t.id} style={{ padding: '6px 0', borderBottom: `1px solid ${theme.semanticColors.variantBorder}` }}>
                    {t.webUrl ? <Link href={t.webUrl} target="_blank" rel="noopener noreferrer">{t.title}</Link> : t.title}
                    <div style={{ fontSize: 12, color: theme.semanticColors.bodySubtext }}>
                      {format(strings.SourceLabel, t.source)}
                      {t.dueDate ? ` · ${format(strings.DueOn, formatDate(t.dueDate, locale))}` : ''}
                      {t.status === 'inProgress' ? ` · ${strings.InProgress}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {result.hidden > 0 && <p role="status">{format(strings.MoreHidden, result.hidden)}</p>}
        </>
      ))}
    </section>
  );
};

const MyTasks: React.FC<IMyTasksProps> = (props) => (
  <ThemedRoot theme={props.theme}><MyTasksInner {...props} /></ThemedRoot>
);

export default MyTasks;
