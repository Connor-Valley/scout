export type Style = (text: string) => string;
const plain: Style = (text) => text;

export type RowKind = 'title' | 'missing';
export type Row = [label: string, value: string, kind?: RowKind];

export function row(label: string, value: string | null, fallback: string): Row {
    return value ? [label, value] : [label, fallback, 'missing'];
}

export interface RowStyles { label: Style; title: Style; missing: Style; }
const plainStyles: RowStyles = { label: plain, title: plain, missing: plain };

export function formatRows(rows: Row[], styles: RowStyles = plainStyles): string[] {
    const labelWidth = Math.max(...rows.map(([label]) => label.length)) + 2;
    return rows.map(([label, value, kind]) => {
        const styleValue = kind ? styles[kind] : plain;
        return `${styles.label(label.padEnd(labelWidth))}${styleValue(value)}`;
    });
}

export function printRows(rows: Row[], styles?: RowStyles) {
    formatRows(rows, styles).forEach((line) => console.log(line));
}

export function printJson(data: unknown) {
    console.log(JSON.stringify(data, null, 2));
}
