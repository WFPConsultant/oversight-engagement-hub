import * as React from 'react';
import { DonutChart, IChartProps, IVerticalBarChartDataPoint, VerticalBarChart } from '@fluentui/react-charting';

export interface IChartsProps {
  statusTitle: string;
  statusData: Array<{ label: string; value: number; color: string }>;
  priorityTitle: string;
  priorityData: Array<{ label: string; value: number; color: string }>;
  total: number;
}

/**
 * Isolated in its own file so `React.lazy` splits @fluentui/react-charting into a separate chunk that only
 * loads when the dashboard is shown (keeps the initial web part bundle small).
 */
const Charts: React.FC<IChartsProps> = ({ statusTitle, statusData, priorityTitle, priorityData, total }) => {
  const donut: IChartProps = {
    chartTitle: statusTitle,
    chartData: statusData.map((d) => ({ legend: d.label, data: d.value, color: d.color }))
  };
  const bars: IVerticalBarChartDataPoint[] = priorityData.map((d) => ({
    x: d.label, y: d.value, legend: d.label, color: d.color
  }));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <h3 style={{ margin: '0 0 4px' }}>{statusTitle}</h3>
        <DonutChart data={donut} innerRadius={55} width={320} height={260} valueInsideDonut={total} />
      </div>
      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <h3 style={{ margin: '0 0 4px' }}>{priorityTitle}</h3>
        <VerticalBarChart data={bars} width={320} height={260} barWidth={40} hideLegend={false} />
      </div>
    </div>
  );
};

export default Charts;
