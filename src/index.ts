#!/usr/bin/env node
import { domainRows, type DomainSummary } from './domain/summary.js';
import { emailRows, type EmailSummary } from './email/summary.js';
import { printRows, printJson, type RowStyles } from './output.js';
import { summarizePhone, phoneRows } from './phone/summary.js';
import { parseCliArgs, printHelp, USAGE } from "./cli.js";
import { lookupDomain } from './domain/lookup.js';
import { lookupEmail } from './email/lookup.js';
import { handleError } from "./errors.js";
import pc from 'picocolors';

const { values, positionals } = parseCliArgs();

const colors = pc.createColors(pc.isColorSupported && !values['no-color']);
const rowStyles: RowStyles = { label: colors.cyan, title: colors.bold, missing: colors.dim };

if (values.help) {
    printHelp();
    process.exit(0);
}

if (positionals.length > 0) {
    console.error(colors.red(`Got extra arguments: ${positionals.join(' ')}. Did you forget quotes around the number?`));
    process.exit(1);
}

if (values.domain) {
    let summary: DomainSummary;

    try {
        summary = await lookupDomain(values.domain);
    } catch (error) {
        handleError(error, values.debug, colors.red);
    }

    if (values.json) {
        printJson(summary);
    } else {
        printRows(domainRows(summary), rowStyles);
    }
} else if (values.phone) {
    const summary = summarizePhone(values.phone);
    if (!summary) {
        console.error(colors.red(`Couldn't parse phone number: ${values.phone}`));
        process.exit(1);
    }
    if (values.json) {
        printJson(summary);
    } else {
        printRows(phoneRows(summary), rowStyles);
    }
} else if (values.email) {
    let summary: EmailSummary;
    try {
        summary = await lookupEmail(values.email);
    } catch (error) {
        handleError(error, values.debug, colors.red)
    }

    if (values.json) {
        printJson(summary);
    } else {
        printRows(emailRows(summary), rowStyles);
    }
} else {
    console.error(USAGE);
    process.exit(1);
}
