import * as React from 'react';
import { ITheme, ThemeProvider } from '@fluentui/react';

export interface IThemedRootProps {
  theme?: ITheme;
  children?: React.ReactNode;
}

/** Applies the SharePoint site theme to everything below it. */
export const ThemedRoot: React.FC<IThemedRootProps> = ({ theme, children }) => (
  <ThemeProvider theme={theme} applyTo="none">{children}</ThemeProvider>
);
