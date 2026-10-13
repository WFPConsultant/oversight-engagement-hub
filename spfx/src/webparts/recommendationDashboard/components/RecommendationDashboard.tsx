import * as React from 'react';
import { Toggle, useTheme } from '@fluentui/react';
import { IRecommendation } from '../../../models';
import {
  DemoBanner, EmptyState, ErrorState, LoadingState, StatusBadge, SummaryCard, ThemedRoot
} from '../../../components';
import { useAsync } from '../../../hooks/useAsync';
import { daysUntil, isOverdue } from '../../../utils/dates';
import { format, formatDate } from '../../../utils/format';
import { isActive, summarizeRecommendations } from '../../../utils/recommendationSummary';
import { riskTone } from '../../../utils/tones';
import { IRecommendationDashboardProps } from './IRecommendationDashboardProps';

const Charts = React.lazy(() => import(/* webpackChunkName: 'dashboard-charts' */ './Charts'));

const tableStyle: React.CSSProperties = { borderCollapse: 'collapse', width: '100%' };

const DataTable: React.FC<{ caption: string; headers: string[]; rows: Array<Array<React.ReactNode>> }> = ({ caption, headers, rows }) => {
  const border = useTheme().semanticColors.variantBorder;
  const cell: React.CSSProperties = { textAlign: 'left', padding: '6px 10px', borderBottom: `1px solid ${border}` };
  return (
  <table style={tableStyle}>
    <caption style={{ textAlign: 'left', fontWeight: 600, padding: '4px 0' }}>{caption}</caption>
    <thead><tr>{headers.map((h) => <th key={h} scope="col" style={cell}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row" style={cell}>{c}</th> : <td key={j} style={cell}>{c}</td>))}</tr>)}</tbody>
  </table>
  );
};

const RecommendationDashboardInner: React.FC<IRecommendationDashboardProps> = (props) => {
  const { service, strings, locale } = props;
  const now = props.now ?? (() => new Date());
  const theme = useTheme();
  const { data, error, loading, reload } = useAsync(() => service.getRecommendations(), [service]);
  const [asTable, setAsTable] = React.useState(props.showTables);
  React.useEffect(() => setAsTable(props.showTables), [props.showTables]);

  const summary = React.useMemo(() => (data ? summarizeRecommendations(data, now()) : undefined), [data]);

  const overdueList = React.useMemo<IRecommendation[]>(
    () =>
      (data ?? [])
        .filter((r) => isActive(r) && isOverdue(r.targetDate, now()))
        .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
        .slice(0, props.topOverdueCount),
    [data, props.topOverdueCount]
  );

  const p = theme.palette;
  const statusData = summary && [
    { label: strings.Status_Open, value: summary.byStatus.Open, color: p.orange },
    { label: strings.Status_InProgress, value: summary.byStatus['In Progress'], color: p.themePrimary },
    { label: strings.Status_Implemented, value: summary.byStatus.Implemented, color: p.green },
    { label: strings.Status_Closed, value: summary.byStatus.Closed, color: p.neutralSecondary },
    { label: strings.Status_NotAccepted, value: summary.byStatus['Not Accepted'], color: p.neutralTertiary }
  ].filter((d) => d.value > 0);
  const priorityData = summary && [
    { label: 'High', value: summary.overdueByPriority.High, color: p.redDark },
    { label: 'Medium', value: summary.overdueByPriority.Medium, color: p.orange },
    { label: 'Low', value: summary.overdueByPriority.Low, color: p.neutralSecondary }
  ];

  return (
    <section aria-label={props.title}>
      <h2 style={{ margin: '0 0 8px' }}>{props.title}</h2>
      {props.isDemo && <DemoBanner text={strings.DemoBanner} />}
      {loading && <LoadingState label={strings.Loading} />}
      {error && <ErrorState message={strings.LoadError} detail={error.message} retryLabel={strings.Retry} onRetry={reload} />}
      {summary && statusData && priorityData && (
        <>
          <div role="region" aria-label={strings.CardsLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '12px 0' }}>
            <SummaryCard label={strings.CardTotal} value={summary.total} />
            <SummaryCard label={strings.CardOpen} value={summary.open} hint={strings.CardOpenHint} tone="info" />
            <SummaryCard label={strings.CardOverdue} value={summary.overdue} hint={strings.CardOverdueHint} tone={summary.overdue ? 'danger' : 'success'} />
            <SummaryCard label={strings.CardHighPriority} value={summary.highPriorityOpen} tone="warning" />
            <SummaryCard label={strings.CardImplemented} value={summary.implemented} hint={format(strings.CardImplementedHint, summary.implementationRate)} tone="success" />
          </div>

          <Toggle label={strings.ShowAsTable} inlineLabel checked={asTable} onChange={(_e, c) => setAsTable(!!c)} />
          {asTable ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, margin: '8px 0' }}>
              <div style={{ flex: '1 1 280px' }}>
                <DataTable caption={strings.ChartByStatus} headers={[strings.ColStatus, strings.ColCount]} rows={statusData.map((d) => [d.label, d.value])} />
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <DataTable caption={strings.ChartOverdueByPriority} headers={[strings.ColPriority, strings.ColCount]} rows={priorityData.map((d) => [d.label, d.value])} />
              </div>
            </div>
          ) : (
            <React.Suspense fallback={<LoadingState label={strings.ChartLoading} />}>
              <Charts
                statusTitle={strings.ChartByStatus} statusData={statusData}
                priorityTitle={strings.ChartOverdueByPriority} priorityData={priorityData}
                total={summary.total}
              />
            </React.Suspense>
          )}

          <div style={{ marginTop: 16 }}>
            {overdueList.length === 0 ? (
              <EmptyState message={strings.NoOverdue} />
            ) : (
              <DataTable
                caption={strings.TopOverdueTitle}
                headers={[strings.ColRef, strings.ColEngagement, strings.ColPriority, strings.ColOwner, strings.ColTarget, strings.ColDaysOverdue]}
                rows={overdueList.map((r) => [
                  r.url ? <a href={r.url}>{r.ref}</a> : r.ref,
                  r.engagementRef,
                  <StatusBadge key="p" label={r.priority} tone={riskTone(r.priority)} />,
                  r.owner.displayName,
                  formatDate(r.targetDate, locale),
                  Math.abs(daysUntil(r.targetDate, now()))
                ])}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
};

const RecommendationDashboard: React.FC<IRecommendationDashboardProps> = (props) => (
  <ThemedRoot theme={props.theme}><RecommendationDashboardInner {...props} /></ThemedRoot>
);

export default RecommendationDashboard;
