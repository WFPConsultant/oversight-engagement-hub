import * as React from 'react';
import {
  CheckboxVisibility, DetailsList, DetailsListLayoutMode, Dropdown, IColumn, IDropdownOption, Icon, Link, SearchBox,
  SelectionMode, Stack, Toggle
} from '@fluentui/react';
import { EngagementStatus, IEngagement } from '../../../models';
import {
  DemoBanner, EmptyState, ErrorState, LiveRegion, LoadingState, StatusBadge, ThemedRoot
} from '../../../components';
import { useAsync } from '../../../hooks/useAsync';
import { daysUntil, isOverdue } from '../../../utils/dates';
import { EngagementSortKey, filterEngagements, sortEngagements } from '../../../utils/engagementList';
import { format, formatDate } from '../../../utils/format';
import { engagementStatusTone, riskTone } from '../../../utils/tones';
import { IEngagementTrackerProps } from './IEngagementTrackerProps';

const STATUSES: EngagementStatus[] = ['Planning', 'Fieldwork', 'Reporting', 'Follow-up', 'Closed'];

const EngagementTracker: React.FC<IEngagementTrackerProps> = (props) => {
  const { service, strings, locale, dueSoonDays } = props;
  const { data, error, loading, reload } = useAsync(() => service.getEngagements(), [service]);

  const [text, setText] = React.useState('');
  const [status, setStatus] = React.useState<EngagementStatus | 'all'>('all');
  const [showClosed, setShowClosed] = React.useState(props.showClosed);
  const [sortKey, setSortKey] = React.useState<EngagementSortKey>('dueDate');
  const [descending, setDescending] = React.useState(false);

  React.useEffect(() => setShowClosed(props.showClosed), [props.showClosed]);

  const visible = React.useMemo(
    () => sortEngagements(filterEngagements(data ?? [], { text, status, showClosed }), sortKey, descending),
    [data, text, status, showClosed, sortKey, descending]
  );

  const statusOptions: IDropdownOption[] = [
    { key: 'all', text: strings.StatusAll },
    ...STATUSES.map((s) => ({ key: s, text: s }))
  ];

  const sortLabel = (key: EngagementSortKey): string =>
    key !== sortKey ? strings.NotSorted : descending ? strings.SortedDescending : strings.SortedAscending;

  const col = (key: EngagementSortKey, name: string, minWidth: number, maxWidth?: number): IColumn => ({
    key, name, fieldName: key, minWidth, maxWidth, isResizable: true,
    isSorted: key === sortKey, isSortedDescending: key === sortKey && descending,
    ariaLabel: `${name}, ${sortLabel(key)}`,
    onColumnClick: () => {
      if (key === sortKey) setDescending(!descending);
      else { setSortKey(key); setDescending(false); }
    }
  });

  const columns: IColumn[] = [
    col('ref', strings.ColRef, 95, 110),
    col('title', strings.ColTitle, 180),
    col('type', strings.ColType, 80, 100),
    col('status', strings.ColStatus, 100, 120),
    col('lead', strings.ColLead, 110, 150),
    col('dueDate', strings.ColDue, 130, 160),
    col('riskRating', strings.ColRisk, 70, 90)
  ];

  const renderCell = (e?: IEngagement, _i?: number, c?: IColumn): React.ReactNode => {
    if (!e || !c) return null;
    switch (c.key) {
      case 'title': return e.url ? <Link href={e.url}>{e.title}</Link> : e.title;
      case 'status': return <StatusBadge label={e.status} tone={engagementStatusTone(e.status)} />;
      case 'lead': return e.lead.displayName;
      case 'riskRating': return <StatusBadge label={e.riskRating} tone={riskTone(e.riskRating)} />;
      case 'dueDate': {
        const open = e.status !== 'Closed';
        const late = open && isOverdue(e.dueDate);
        const soon = open && !late && daysUntil(e.dueDate) <= dueSoonDays;
        return (
          <span>
            {formatDate(e.dueDate, locale)}
            {(late || soon) && (
              <span style={{ marginLeft: 6, fontWeight: 600 }}>
                <Icon iconName={late ? 'Warning' : 'Clock'} aria-hidden="true" /> {late ? strings.Overdue : strings.DueSoon}
              </span>
            )}
          </span>
        );
      }
      default: return String((e as unknown as Record<string, unknown>)[c.key]);
    }
  };

  return (
    <ThemedRoot theme={props.theme}>
      <section aria-label={props.title}>
        <h2 style={{ margin: '0 0 8px' }}>{props.title}</h2>
        {props.isDemo && <DemoBanner text={strings.DemoBanner} />}
        {loading && <LoadingState label={strings.Loading} />}
        {error && <ErrorState message={strings.LoadError} detail={error.message} retryLabel={strings.Retry} onRetry={reload} />}
        {data && (
          <>
            <Stack horizontal wrap tokens={{ childrenGap: 12 }} verticalAlign="end" styles={{ root: { margin: '8px 0' } }}>
              <Stack.Item grow styles={{ root: { minWidth: 220, maxWidth: 420 } }}>
                <SearchBox
                  ariaLabel={strings.SearchLabel}
                  placeholder={strings.SearchPlaceholder}
                  value={text}
                  onChange={(_e, v) => setText(v ?? '')}
                  onClear={() => setText('')}
                />
              </Stack.Item>
              <Dropdown
                label={strings.StatusFilterLabel}
                options={statusOptions}
                selectedKey={status}
                onChange={(_e, o) => o && setStatus(o.key as EngagementStatus | 'all')}
                styles={{ root: { minWidth: 160 } }}
              />
              <Toggle label={strings.ShowClosedToggle} inlineLabel checked={showClosed} onChange={(_e, c) => setShowClosed(!!c)} />
            </Stack>
            <LiveRegion message={format(strings.ResultsCount, visible.length, data.length)} />
            <div aria-hidden="true" style={{ fontSize: 12, marginBottom: 4 }}>{format(strings.ResultsCount, visible.length, data.length)}</div>
            {visible.length === 0 ? (
              <EmptyState message={strings.Empty} />
            ) : (
              <DetailsList
                items={visible}
                columns={columns}
                onRenderItemColumn={renderCell}
                selectionMode={SelectionMode.none}
                checkboxVisibility={CheckboxVisibility.hidden}
                layoutMode={DetailsListLayoutMode.justified}
                ariaLabelForGrid={strings.GridLabel}
                getKey={(e: IEngagement) => String(e.id)}
              />
            )}
          </>
        )}
      </section>
    </ThemedRoot>
  );
};

export default EngagementTracker;
