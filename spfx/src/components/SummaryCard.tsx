import * as React from 'react';
import { mergeStyles, useTheme } from '@fluentui/react';
import { Tone } from '../utils/tones';

export interface ISummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}

/** A single KPI. Rendered as a labelled group so a screen reader reads "Overdue: 7, hint". */
export const SummaryCard: React.FC<ISummaryCardProps> = ({ label, value, hint, tone = 'neutral' }) => {
  const { semanticColors: c, palette: p, fonts } = useTheme();
  const accent = { neutral: p.neutralTertiary, info: p.themePrimary, success: p.green, warning: p.orange, danger: p.redDark }[tone];
  const id = React.useRef(`sc-${Math.random().toString(36).slice(2, 9)}`).current;
  const card = mergeStyles({
    flex: '1 1 150px', minWidth: 140, padding: '12px 16px', background: c.bodyBackground, color: c.bodyText,
    border: `1px solid ${c.variantBorder}`, borderTop: `4px solid ${accent}`, borderRadius: 4
  });
  const labelCls = mergeStyles(fonts.small, { color: c.bodySubtext });
  const valueCls = mergeStyles(fonts.superLarge, { fontWeight: 600, lineHeight: 1.2 });
  return (
    <div className={card} role="group" aria-labelledby={`${id}-l`} aria-describedby={hint ? `${id}-h` : undefined}>
      <div id={`${id}-l`} className={labelCls}>{label}</div>
      <div className={valueCls}>{value}</div>
      {hint && <div id={`${id}-h`} className={labelCls}>{hint}</div>}
    </div>
  );
};
