#!/usr/bin/env node
import { fetchDomain } from './domain/rdap.js'
import { fetchDns } from './domain/dns.js'
import { summarizeDomain, domainRows } from './domain/summary.js'
import { printRows } from './output.js'

const inputType = process.argv[2];
const input = process.argv[3];

if (!inputType || !input) {
    console.error('Usage: scout <type> <input>');
    process.exit(1);
}

switch (inputType) {
    case '-d':
    case '--domain':
    case 'domain': {
        const [data, dns] = await Promise.all([fetchDomain(input), fetchDns(input)]);
        const summary = summarizeDomain(input, data, dns);
        printRows(domainRows(summary));
        break;
    }
    default:
        console.error(`Unknown type: ${inputType}`);
        process.exit(1);
}
