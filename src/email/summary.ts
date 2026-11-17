import { type DomainSummary, domainRows } from '../domain/summary.js';
import { type ParsedEmail } from './parse.js';
import { type Row } from '../output.js';

export interface EmailSummary {
    email: string;
    local: string;
    freeProvider: boolean;
    domain: DomainSummary;
}

const freeProviders = new Set(['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me']);

const EMAIL_DOMAIN_LABELS = new Set(['Domain', 'Registered', 'Mail (MX)', 'SPF', 'DMARC Policy']);

export function summarizeEmail(parsed: ParsedEmail, domain: DomainSummary): EmailSummary {
    const freeProvider = freeProviders.has(parsed.domain);

    return { ...parsed, freeProvider, domain };
}

export function emailRows(summary: EmailSummary): Row[] {
    const domainPart = domainRows(summary.domain)
        .filter(([label]) => EMAIL_DOMAIN_LABELS.has(label))
        .map(([label, value, kind]): Row => kind === 'title' ? [label, value] : [label, value, kind] );

    return [
        ['Email', summary.email, 'title'],
        ['Provider', summary.freeProvider ? 'free email provider' : 'not a free email provider'],
        ...domainPart
    ];
}
