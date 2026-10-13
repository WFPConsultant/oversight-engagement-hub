import * as React from 'react';
import * as path from 'path';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockDataService } from '../../../services/MockDataService';
import { FIXED_NOW, loadLocFile } from '../../../testing/testUtils';
import MyTasks from './MyTasks';
import { IMyTasksProps } from './IMyTasksProps';

expect.extend(toHaveNoViolations);

const strings = loadLocFile<IMyTasksWebPartStrings>(path.resolve(__dirname, '../loc'), 'en-us');

const setup = (over: Partial<IMyTasksProps> = {}): ReturnType<typeof render> =>
  render(
    <MyTasks
      service={new MockDataService(() => FIXED_NOW, 0)} title="My Tasks" maxItems={15} isDemo locale="en-GB"
      strings={strings} now={() => FIXED_NOW} {...over}
    />
  );

describe('<MyTasks />', () => {
  it('groups tasks under headings and renders each group as a list', async () => {
    setup();
    await screen.findAllByRole('list');
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
    expect(screen.getByText(strings.DemoBanner)).toBeInTheDocument();
  });

  it('respects the maximum and says how many are hidden', async () => {
    setup({ maxItems: 2 });
    await screen.findAllByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);
    expect(screen.getByText(/more tasks not shown/)).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    setup({ service: { getEngagements: jest.fn(), getRecommendations: jest.fn(), getMyTasks: () => Promise.resolve([]) } });
    expect(await screen.findByText(strings.Empty)).toBeInTheDocument();
  });

  it('explains how to fix a Graph permission error', async () => {
    setup({ service: { getEngagements: jest.fn(), getRecommendations: jest.fn(), getMyTasks: () => Promise.reject(new Error('403 Forbidden')) } });
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Tasks\.Read/)).toBeInTheDocument();
  });

  it('has no detectable accessibility violations (axe)', async () => {
    const { container } = setup();
    await screen.findAllByRole('list');
    expect(await axe(container)).toHaveNoViolations();
  });
});
