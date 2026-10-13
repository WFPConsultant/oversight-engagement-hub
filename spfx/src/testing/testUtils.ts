/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

/** Loads an SPFx AMD loc file (define([], function(){ return {...} })) so tests can use the real strings. */
export function loadLocFile<T>(locDir: string, locale: 'en-us' | 'fr-fr'): T {
  const code = fs.readFileSync(path.join(locDir, `${locale}.js`), 'utf8');
  // Loc files are `define([], function() { return { ... } });` with a plain JSON object literal.
  const body = /return\s*(\{[\s\S]*\})\s*\}\s*\)\s*;?\s*$/.exec(code);
  if (!body) throw new Error(`Unrecognised loc file format: ${locDir}/${locale}.js`);
  return JSON.parse(body[1]) as T;
}

export const FIXED_NOW = new Date(2026, 5, 15, 9, 0);
