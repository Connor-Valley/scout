export function printRows(rows: [string, string][]) {
    for (const [label, value] of rows) {
        console.log(`${label.padEnd(14)}${value}`);
    }
}