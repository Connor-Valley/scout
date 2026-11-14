#!/usr/bin/env node
import { fetchDomain } from './domain/rdap.js';
import { fetchDns } from './domain/dns.js';
import { summarizeDomain, domainRows } from './domain/summary.js';
import { printRows, printJson } from './output.js';
import { summarizePhone, phoneRows } from './phone/summary.js';
import { parseCliArgs, printHelp, USAGE } from "./cli.js";

const { values, positionals } = parseCliArgs();

if (values.help) {
    printHelp();
    process.exit(0);
}

if (positionals.length > 0) {
    console.error(`Got extra arguments: ${positionals.join(' ')}. Did you forget quotes around the number?`);
    process.exit(1);
}

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
    console.error(USAGE);
    process.exit(1);
}
