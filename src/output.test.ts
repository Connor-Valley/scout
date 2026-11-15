import { describe, it, expect } from 'vitest';
import { formatRows } from './output.js';

describe('formatRows', () => {
    it('lines up values 2 spaces after longest label', () => {
        const rows: [string, string][] = [
            ['Domain', 'google.com'],
            ['Test Long Label', 'test']
        ];
        const formattedRows = formatRows(rows);

        expect(formattedRows).toEqual([
            'Domain           google.com',
            'Test Long Label  test'
        ]);
    });

    it('handles empty input', () => {
        const rows: [string, string][] = [];
        const formattedRows = formatRows(rows);

        expect(formattedRows).toEqual([]);
    });

    it('leaves values unchanged', () => {
        const rows: [string, string][] = [
            ['test', 'a, b, c']
        ];
        const formattedRows = formatRows(rows);

        expect(formattedRows).toEqual([
            'test  a, b, c'
        ]);
    });
});
