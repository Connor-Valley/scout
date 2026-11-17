import { describe, it, expect } from 'vitest';
import { summarizeEmail, emailRows, type EmailSummary } from './summary.js';
import { type ParsedEmail } from './parse.js';
import { type DomainSummary } from '../domain/summary.js'


const baseDomain: DomainSummary = {
    domain: 'example.com',
    registered: '2010-05-01',
    ageYears: 15,
    expires: '2030-05-01',
    nameservers: ['NS1.EXAMPLE.COM', 'NS2.EXAMPLE.COM'],
    ipv4: ['93.184.216.34', '192.0.2.10'],
    ipv6: ['2607:f8b0:4009:81c::200e','2001:db8::1'],
    mx: ['mail.example.com'],
    spf: 'v=spf1 include:_spf.example.com ~all',
    dmarc: 'v=DMARC1; p=reject; rua=mailto:reports@example.com',
    dmarcPolicy: 'reject',
    services: ['google', 'facebook', 'docusign']
};

const baseParsed: ParsedEmail = { email: 'billing@example.com', local: 'billing', domain: 'example.com' }

const baseSummary: EmailSummary = {
    email: 'billing@example.com',
    local: 'billing',
    freeProvider: false,
    domain: baseDomain,
};

describe('summarizeEmail', () => {
    it('correctly identifies free providers', () => {
        const parsed = { ...baseParsed, email: 'test@gmail.com', domain: 'gmail.com' };
        const summary = summarizeEmail(parsed, baseDomain);

        expect(summary.freeProvider).toBe(true);
    });

    it('correctly identifies non-free providers', () => {
        const summary = summarizeEmail(baseParsed, baseDomain);

        expect(summary.freeProvider).toBe(false);
    });

    it('correctly summarizes an email', () => {
        const summary = summarizeEmail(baseParsed, baseDomain);

        expect(summary).toEqual(baseSummary);
    });
});

describe('emailRows', () => {
    it('correctly formats email rows', () => {
        const rows = emailRows(baseSummary);

        expect(rows).toEqual([
            ['Email', 'billing@example.com', 'title'],
            ['Provider', 'not a free email provider'],
            ['Domain', 'example.com'],
            ['Registered', '2010-05-01 (15 years ago)'],
            ['Mail (MX)', 'mail.example.com'],
            ['SPF', 'v=spf1 include:_spf.example.com ~all'],
            ['DMARC Policy', 'reject'],
        ]);
    });

    it('correctly formats free provider result', () => {
        const summary = { ...baseSummary, freeProvider: true };
        const rows = emailRows(summary);

        expect(rows).toContainEqual(['Provider', 'free email provider']);
    });
});
