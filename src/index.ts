#!/usr/bin/env node
import {domainRows, type DomainSummary} from './domain/summary.js';
import { printRows, printJson } from './output.js';
import { summarizePhone, phoneRows } from './phone/summary.js';
import { parseCliArgs, printHelp, USAGE } from "./cli.js";
import { lookupDomain } from './domain/lookup.js'
import { ScoutError } from "./errors.js";

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
    let summary: DomainSummary;

    try {
        summary = await lookupDomain(values.domain);
    } catch (error) {
        if (error instanceof ScoutError) {
            console.error(error.message);
            process.exit(1);
        }
        throw error;
    }

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
