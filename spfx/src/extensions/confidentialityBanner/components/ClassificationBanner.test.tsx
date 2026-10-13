import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CLASSIFICATION_COLORS, Classification, ClassificationBanner, ClassificationFooter } from './ClassificationBanner';

expect.extend(toHaveNoViolations);

/** WCAG relative luminance contrast ratio of white text on a hex background. */
function contrastWithWhite(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return 1.05 / (lum + 0.05);
}

describe('classification banner', () => {
  it('is a labelled region that includes the classification text', () => {
    render(<ClassificationBanner classification="Confidential" label="CONFIDENTIAL" message="Handle with care" regionLabel="Information classification" />);
    expect(screen.getByRole('region', { name: 'Information classification: CONFIDENTIAL' })).toHaveTextContent('Handle with care');
  });

  it.each(Object.keys(CLASSIFICATION_COLORS) as Classification[])('%s: white text meets WCAG AAA contrast (>= 7:1)', (level) => {
    expect(contrastWithWhite(CLASSIFICATION_COLORS[level])).toBeGreaterThanOrEqual(7);
  });

  it('has no axe violations, including the footer link', async () => {
    const { container } = render(
      <>
        <ClassificationBanner classification="Strictly Confidential" label="STRICTLY CONFIDENTIAL" message="Restricted" regionLabel="Information classification" />
        <ClassificationFooter text="Example Oversight Office" policyUrl="https://example.invalid/policy" policyLinkText="Handling policy" />
      </>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
