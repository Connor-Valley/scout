import { describe, it, expect } from 'vitest';
import { formatRows, type RowStyles, type Row } from './output.js';

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

    it('applies label, title and missing styles to the right parts', () => {
        const marks: RowStyles = {
            label: (s) => `[L]${s}`,
            title: (s) => `<b>${s}</b>`,
            missing: (s) => `<dim>${s}</dim>`,
        };

        const rows: Row[] = [
            ['Domain', 'google.com', 'title'],
            ['Expires', '2028-09-14'],
            ['IPv6', 'no IPv6 found', 'missing'],
        ];

        expect(formatRows(rows, marks)).toEqual([
            '[L]Domain   <b>google.com</b>',
            '[L]Expires  2028-09-14',
            '[L]IPv6     <dim>no IPv6 found</dim>',
        ]);
    });
});
