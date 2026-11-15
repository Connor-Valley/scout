export function formatRows(rows: [string, string][]): string[] {
    const labelWidth = Math.max(...rows.map(([label]) => label.length)) + 2;

    return rows.map(([label, value]) => `${label.padEnd(labelWidth)}${value}`);
}

export function printRows(rows: [string, string][]) {
    formatRows(rows).forEach((line) => console.log(line))
}

export function printJson(data: unknown) {
    console.log(JSON.stringify(data, null, 2));
}
