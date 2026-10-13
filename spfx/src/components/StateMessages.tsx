import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';

export const LoadingState: React.FC<{ label: string }> = ({ label }) => (
  <div role="status"><Spinner size={SpinnerSize.large} label={label} ariaLive="polite" /></div>
);

export interface IErrorStateProps {
  message: string;
  detail?: string;
  retryLabel: string;
  onRetry: () => void;
}

/** role="alert" so the failure is announced immediately; retry is keyboard reachable. */
export const ErrorState: React.FC<IErrorStateProps> = ({ message, detail, retryLabel, onRetry }) => (
  <MessageBar
    messageBarType={MessageBarType.error}
    isMultiline
    actions={<div><DefaultButton onClick={onRetry}>{retryLabel}</DefaultButton></div>}
  >
    {message}{detail ? <><br /><small>{detail}</small></> : null}
  </MessageBar>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p role="status" style={{ margin: '16px 0' }}>{message}</p>
);

/** Shown whenever sample data is in use, so a demo can never be mistaken for real records. */
export const DemoBanner: React.FC<{ text: string }> = ({ text }) => (
  <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>{text}</MessageBar>
);
