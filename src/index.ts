#!/usr/bin/env node
import { fetchDomain } from './domain/rdap.js';
import { fetchDns } from './domain/dns.js';
import { summarizeDomain, domainRows } from './domain/summary.js';
import { printRows, printJson } from './output.js';
import { parseArgs } from 'node:util';
import { summarizePhone, phoneRows } from './phone/summary.js';

const usageMessage = 'Usage: scout -d <domain> | -p <phone> [--json]';

function parseCliArgs() {
    try {
        const { values } = parseArgs({
            options: {
                domain: { type: 'string', short: 'd' },
                phone: { type: 'string', short: 'p' },
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
} else if (values.phone) {
    const summary = summarizePhone(values.phone);
    if (!summary) {
        console.error(`Couldn't parse phone number: ${values.phone}`);
        process.exit(1);
    }
    if (values.json) {
        printJson(summary);
    } else {
        printRows(phoneRows(summary));
    }

} else {
    console.error(usageMessage);
    process.exit(1);
}
