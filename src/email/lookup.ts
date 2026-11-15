import { parseEmail } from "./parse.js";
import { type EmailSummary, summarizeEmail } from './summary.js';
import { ScoutError } from '../errors.js';
import { lookupDomain } from '../domain/lookup.js';

export async function lookupEmail(input: string): Promise<EmailSummary> {
    const parsed = parseEmail(input);
    if (!parsed) throw new ScoutError(`Not a valid email address: ${input}`);

    const domainSummary = await lookupDomain(parsed.domain);
    return summarizeEmail(parsed, domainSummary);
}
