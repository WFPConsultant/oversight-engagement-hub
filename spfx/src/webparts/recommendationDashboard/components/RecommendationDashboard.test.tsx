import * as React from 'react';
import * as path from 'path';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockDataService } from '../../../services/MockDataService';
import { FIXED_NOW, loadLocFile } from '../../../testing/testUtils';
import { summarizeRecommendations } from '../../../utils/recommendationSummary';
import RecommendationDashboard from './RecommendationDashboard';

expect.extend(toHaveNoViolations);

const strings = loadLocFile<IRecommendationDashboardWebPartStrings>(path.resolve(__dirname, '../loc'), 'en-us');
const service = new MockDataService(() => FIXED_NOW, 0);

// showTables=true renders accessible tables instead of the (lazy-loaded SVG) charts, which jsdom cannot lay out.
const setup = (): ReturnType<typeof render> =>
  render(
    <RecommendationDashboard
      service={service} title="Recommendation Follow-up" showTables topOverdueCount={5} isDemo locale="en-GB"
      strings={strings} now={() => FIXED_NOW}
    />
  );

describe('<RecommendationDashboard />', () => {
  it('shows summary cards whose numbers match the data', async () => {
    setup();
    const summary = summarizeRecommendations(await service.getRecommendations(), FIXED_NOW);
    const region = await screen.findByRole('region', { name: strings.CardsLabel });
    const overdue = within(region).getByRole('group', { name: strings.CardOverdue });
    expect(overdue).toHaveTextContent(String(summary.overdue));
    expect(within(region).getByRole('group', { name: strings.CardTotal })).toHaveTextContent(String(summary.total));
    expect(summary.overdue).toBeGreaterThan(0);
  });

  it('lists the most overdue recommendations in a real table with headers', async () => {
    setup();
    const table = await screen.findByRole('table', { name: strings.TopOverdueTitle });
    expect(within(table).getAllByRole('columnheader').length).toBe(6);
    expect(within(table).getAllByRole('row').length).toBeLessThanOrEqual(6); // header + max 5
  });

  it('offers chart data as tables (non-visual alternative)', async () => {
    setup();
    expect(await screen.findByRole('table', { name: strings.ChartByStatus })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: strings.ChartOverdueByPriority })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations (axe)', async () => {
    const { container } = setup();
    await screen.findByRole('region', { name: strings.CardsLabel });
    expect(await axe(container)).toHaveNoViolations();
  });
});
