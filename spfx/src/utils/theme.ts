import { createTheme, IPalette, ISemanticColors, ITheme } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

/** Converts the SharePoint site theme into a Fluent theme so components follow the site's colours (incl. dark/inverted). */
export function toFluentTheme(theme?: IReadonlyTheme): ITheme | undefined {
  if (!theme) return undefined;
  return createTheme({
    palette: theme.palette as Partial<IPalette>,
    semanticColors: theme.semanticColors as Partial<ISemanticColors>,
    isInverted: !!theme.isInverted
  });
}
