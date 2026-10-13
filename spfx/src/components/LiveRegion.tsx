import * as React from 'react';

const visuallyHidden: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0
};

/** Screen-reader-only polite announcement (e.g. "12 engagements shown"). */
export const LiveRegion: React.FC<{ message: string }> = ({ message }) => (
  <div style={visuallyHidden} role="status" aria-live="polite" aria-atomic="true">{message}</div>
);
