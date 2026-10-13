import * as React from 'react';
import { mergeStyles, useTheme } from '@fluentui/react';
import { Tone } from '../utils/tones';

export interface IStatusBadgeProps {
  label: string;
  tone: Tone;
}

/**
 * Status chip. Meaning is carried by the text and a leading shape, never by colour alone (WCAG 1.4.1);
 * colours come from the theme's semantic slots so contrast follows the site theme.
 */
export const StatusBadge: React.FC<IStatusBadgeProps> = ({ label, tone }) => {
  const { semanticColors: c, palette: p } = useTheme();
  const accent: Record<Tone, string> = {
    neutral: p.neutralSecondary, info: p.themePrimary, success: p.green, warning: p.orange, danger: p.redDark
  };
  const shape: Record<Tone, string> = { neutral: '○', info: '◆', success: '✓', warning: '▲', danger: '●' };
  const cls = mergeStyles({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap',
    color: c.bodyText, background: c.bodyBackgroundHovered, border: `1px solid ${accent[tone]}`, fontSize: 12
  });
  return (
    <span className={cls}>
      <span aria-hidden="true" style={{ color: accent[tone] }}>{shape[tone]}</span>
      {label}
    </span>
  );
};
