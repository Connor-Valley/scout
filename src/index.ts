#!/usr/bin/env node
import { fetchDomain } from './domain/rdap.js'
import { fetchDns } from './domain/dns.js'
import { summarizeDomain, domainRows } from './domain/summary.js'
import { printRows, printJson } from './output.js'
import { parseArgs } from 'node:util';

const usageMessage = 'Usage: scout -d <domain> [--json]';

function parseCliArgs() {
    try {
        const { values } = parseArgs({
            options: {
                domain: { type: 'string', short: 'd' },
                json: { type: 'boolean' },
            },
        });
        return values;
    } catch {
        console.error(usageMessage);
        process.exit(1);
    }
}

const values = parseCliArgs();


if (values.domain) {
    const [data, dns] = await Promise.all([fetchDomain(values.domain), fetchDns(values.domain)]);
    const summary = summarizeDomain(values.domain, data, dns);
    if (values.json) {
        printJson(summary);
    } else {
        printRows(domainRows(summary));
    }
} else {
    console.error(usageMessage);
    process.exit(1);
}
