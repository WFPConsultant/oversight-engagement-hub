/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { loadLocFile } from './testUtils';

const roots = [path.resolve(__dirname, '../webparts'), path.resolve(__dirname, '../extensions')];
const locDirs = roots.flatMap((r) =>
  fs.readdirSync(r).map((d) => path.join(r, d, 'loc')).filter((d) => fs.existsSync(path.join(d, 'en-us.js')))
);
const cases = locDirs.map((d): [string, string] => [path.basename(path.dirname(d)), d]);

describe('localization', () => {
  it('finds all four localized components', () => {
    expect(locDirs.length).toBe(4);
  });

  it.each(cases)('%s: French has exactly the same keys as English, none empty', (_name, dir) => {
    const en = loadLocFile<Record<string, string>>(dir, 'en-us');
    const fr = loadLocFile<Record<string, string>>(dir, 'fr-fr');
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
    expect(Object.values(fr).every((v) => v.trim().length > 0)).toBe(true);
  });

  it.each(cases)('%s: {n} placeholders match between languages', (_name, dir) => {
    const en = loadLocFile<Record<string, string>>(dir, 'en-us');
    const fr = loadLocFile<Record<string, string>>(dir, 'fr-fr');
    const ph = (s: string): string[] => (s.match(/\{\d+\}/g) ?? []).sort();
    for (const k of Object.keys(en)) expect(ph(fr[k])).toEqual(ph(en[k]));
  });
});
