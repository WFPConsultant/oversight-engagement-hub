import * as React from 'react';

export type Classification = 'Internal' | 'Confidential' | 'Strictly Confidential';

export interface IClassificationBannerProps {
  classification: Classification;
  label: string;
  message: string;
  regionLabel: string;
}

/**
 * Fixed, high-contrast colours on purpose: a classification marking must look the same on every site and
 * theme. All pairs are white text on a dark background (contrast >= 7:1, WCAG AAA).
 * The label is text, so the level is never conveyed by colour alone.
 */
export const CLASSIFICATION_COLORS: Record<Classification, string> = {
  Internal: '#004578',
  Confidential: '#7a3500',
  'Strictly Confidential': '#8b0000'
};

export const ClassificationBanner: React.FC<IClassificationBannerProps> = ({ classification, label, message, regionLabel }) => (
  <div
    role="region"
    aria-label={`${regionLabel}: ${label}`}
    style={{
      background: CLASSIFICATION_COLORS[classification], color: '#ffffff', padding: '6px 16px', fontSize: 14,
      display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'center', borderBottom: '2px solid #ffffff'
    }}
  >
    <strong style={{ letterSpacing: 1 }}>{label}</strong>
    <span>{message}</span>
  </div>
);

export interface IFooterProps {
  text: string;
  policyUrl?: string;
  policyLinkText: string;
}

export const ClassificationFooter: React.FC<IFooterProps> = ({ text, policyUrl, policyLinkText }) => (
  <footer style={{ padding: '6px 16px', fontSize: 12, background: '#f3f2f1', color: '#201f1e', borderTop: '1px solid #8a8886' }}>
    {text}
    {policyUrl && (
      <>
        {' '}
        <a href={policyUrl} style={{ color: '#004578', textDecoration: 'underline' }}>{policyLinkText}</a>
      </>
    )}
  </footer>
);
