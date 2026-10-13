import * as React from 'react';
import * as path from 'path';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockDataService } from '../../../services/MockDataService';
import { FIXED_NOW, loadLocFile } from '../../../testing/testUtils';
import EngagementTracker from './EngagementTracker';
import { IEngagementTrackerProps } from './IEngagementTrackerProps';

expect.extend(toHaveNoViolations);

const strings = loadLocFile<IEngagementTrackerWebPartStrings>(path.resolve(__dirname, '../loc'), 'en-us');

const setup = (over: Partial<IEngagementTrackerProps> = {}): ReturnType<typeof render> =>
  render(
    <EngagementTracker
      service={new MockDataService(() => FIXED_NOW, 0)}
      title="Engagement Tracker"
      showClosed={false}
      dueSoonDays={14}
      isDemo
      locale="en-GB"
      strings={strings}
      {...over}
    />
  );

describe('<EngagementTracker />', () => {
  it('shows a loading state, then the demo banner and the grid', async () => {
    setup();
    expect(screen.getByText(strings.Loading)).toBeInTheDocument();
    expect(await screen.findByRole('grid', { name: strings.GridLabel })).toBeInTheDocument();
    expect(screen.getByText(strings.DemoBanner)).toBeInTheDocument();
  });

  it('hides closed engagements by default and reports the count politely', async () => {
    setup();
    await screen.findByRole('grid');
    expect(screen.getAllByText(/engagements shown/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Grant Management Framework')).not.toBeInTheDocument();
  });

  it('filters by the search box', async () => {
    setup();
    await screen.findByRole('grid');
    await userEvent.type(screen.getByRole('searchbox', { name: strings.SearchLabel }), 'procurement');
    await waitFor(() => expect(screen.getByText('Procurement of Field Logistics Services')).toBeInTheDocument());
    expect(screen.queryByText('Regional Office Cash Management')).not.toBeInTheDocument();
  });

  it('shows an empty message when nothing matches', async () => {
    setup();
    await screen.findByRole('grid');
    await userEvent.type(screen.getByRole('searchbox', { name: strings.SearchLabel }), 'zzzz-no-match');
    expect(await screen.findByText(strings.Empty)).toBeInTheDocument();
  });

  it('flags overdue engagements with text, not colour alone', async () => {
    setup();
    const grid = await screen.findByRole('grid');
    expect(within(grid).getAllByText(strings.Overdue).length).toBeGreaterThan(0);
  });

  it('exposes sort state on the column header when clicked', async () => {
    setup();
    await screen.findByRole('grid');
    await userEvent.click(screen.getByRole('button', { name: `${strings.ColRef}, ${strings.NotSorted}` }));
    await waitFor(() => expect(screen.getByRole('button', { name: `${strings.ColRef}, ${strings.SortedAscending}` })).toBeInTheDocument());
    expect(screen.getAllByRole('columnheader').some((h) => h.getAttribute('aria-sort') === 'ascending')).toBe(true);
  });

  it('shows a retryable error when the service fails', async () => {
    const failing = { getEngagements: () => Promise.reject(new Error('boom')), getRecommendations: jest.fn(), getMyTasks: jest.fn() };
    setup({ service: failing });
    expect(await screen.findByRole('alert')).toHaveTextContent(strings.LoadError);
    expect(screen.getByRole('button', { name: strings.Retry })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations (axe)', async () => {
    const { container } = setup();
    await screen.findByRole('grid');
    expect(await axe(container)).toHaveNoViolations();
  });
});
