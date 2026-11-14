export function printRows(rows: [string, string][]) {
    const labelWidth = Math.max(...rows.map(([label]) => label.length)) + 2;

    for (const [label, value] of rows) {
        console.log(`${label.padEnd(labelWidth)}${value}`);
    }
}

export function printJson(data: unknown) {
    console.log(JSON.stringify(data, null, 2));
}