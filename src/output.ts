export function printRows(rows: [string, string][]) {
    for (const [label, value] of rows) {
        console.log(`${label.padEnd(14)}${value}`);
    }
}

export function printJson(data: unknown) {
    console.log(JSON.stringify(data, null, 2));
}