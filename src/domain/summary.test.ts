import { describe, it, expect, vi, afterEach } from 'vitest';
import {summarizeDomain, domainRows, type DomainSummary} from './summary.js';
import { type RdapDomain } from './rdap.js';
import { type DnsRecords } from './dns.js';

const date = new Date(2026, 1, 1);

const baseRdap: RdapDomain = {
    ldhName: 'EXAMPLE.COM',
    events: [
        { eventAction: 'registration', eventDate: '2010-05-01T00:00:00Z' },
        { eventAction: 'expiration', eventDate: '2030-05-01T00:00:00Z' },
    ],
    nameservers: [{ ldhName: 'NS1.EXAMPLE.COM' }],
};

const baseDns: DnsRecords = {
    a: ['93.184.216.34', '192.0.2.10'],
    aaaa: ['2607:f8b0:4009:81c::200e', '2001:db8::1'],
    mx: [{ exchange: 'mail.example.com', priority: 10 }],
    txt: [
        'v=spf1 include:_spf.example.com ~all',      // SPF, should be excluded from services
        'google-site-verification=abc123',           // suffix to strip
        'google-site-verification=def456',           // duplicate, should be deduped
        'facebook-domain-verification=xyz789',       // different suffix
        'docusign=11111111-2222',                    // no suffix at all
        'randomtoken12345',                          // no "=", should be ignored
    ],
    dmarc: ['v=DMARC1; p=reject; rua=mailto:reports@example.com'],
};

afterEach(() => vi.useRealTimers());

describe('summarizeDomain', () => {
    it('correctly summarizes a domain', () => {
        vi.setSystemTime(date)
        const summary = summarizeDomain('example.com', baseRdap, baseDns);

        expect(summary).toEqual({
            domain: 'example.com',
            registered: '2010-05-01',
            ageYears: 15,
            expires: '2030-05-01',
            nameservers: ['NS1.EXAMPLE.COM'],
            ipv4: ['93.184.216.34', '192.0.2.10'],
            ipv6: ['2607:f8b0:4009:81c::200e', '2001:db8::1'],
            mx: ['mail.example.com'],
            spf: 'v=spf1 include:_spf.example.com ~all',
            dmarc: 'v=DMARC1; p=reject; rua=mailto:reports@example.com',
            dmarcPolicy: 'reject',
            services: ['docusign', 'facebook', 'google'],
        })
    });

    it('correctly handles after anniversary dates', () => {
       const date = new Date(2026, 5, 1);
       vi.setSystemTime(date);
       const summary = summarizeDomain('example.com', baseRdap, baseDns);

       expect(summary.ageYears).toBe(16);
    });

    it('uses a fallback when there are no nameservers', () => {
        const rdap = { ...baseRdap, nameservers: []};
        const summary = summarizeDomain('example.com', rdap, baseDns);

        expect(summary.nameservers).toEqual([]);
    });

    it('uses a fallback when nameservers is undefined', () => {
        const rdap = { ...baseRdap, nameservers: undefined };
        const summary = summarizeDomain('example.com', rdap, baseDns);

        expect(summary.nameservers).toEqual([]);
    })

    it('uses a fallback when there are no events', () => {
        const rdap = { ...baseRdap, events: [] };
        const summary = summarizeDomain('example.com', rdap, baseDns);

        expect(summary.registered).toBeNull();
        expect(summary.expires).toBeNull();
        expect(summary.ageYears).toBeNull();
    });

    it('uses a fallback when there is no ipv4 address', () => {
        const dns = { ...baseDns, a: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.ipv4).toEqual([]);
    });

    it('uses a fallback when there is no ipv6 address', () => {
        const dns = { ...baseDns, aaaa: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.ipv6).toEqual([]);
    })

    it('uses a fallback when there is no mail server', () => {
        const dns = { ...baseDns, mx: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.mx).toEqual([]);
    });

    it('uses a fallback when there are no services', () => {
        const dns = { ...baseDns, txt: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.spf).toBeNull();
        expect(summary.services).toEqual([]);
    });

    it('correctly handles no DMARC records', () => {
        const dns = { ...baseDns, dmarc: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.dmarc).toBeNull();
        expect(summary.dmarcPolicy).toBeNull();
    });

    it('correctly handles no DMARC policy', () => {
        const dns = { ...baseDns, dmarc: ['v=DMARC1; rua=mailto:reports@example.com'] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.dmarc).toBe('v=DMARC1; rua=mailto:reports@example.com');
        expect(summary.dmarcPolicy).toBeNull();
    });

    it('correctly handles sp= in DMARC', () => {
       const dns = { ...baseDns, dmarc: ['v=DMARC1; sp=none; p=reject'] };
       const summary = summarizeDomain('example.com', baseRdap, dns);

       expect(summary.dmarc).toBe('v=DMARC1; sp=none; p=reject');
       expect(summary.dmarcPolicy).toBe('reject');
    });

    it('correctly strips suffixes from services', () => {
        const summary = summarizeDomain('example.com', baseRdap, baseDns);

        expect(summary.services).toEqual(['docusign', 'facebook', 'google']);
    });

    it('correctly sorts services', () => {
        const dns = {...baseDns, txt: ['MS=abc', 'apple-domain-verification=x', 'zoom-domain-verification=y']}
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.services).toEqual(['apple', 'MS', 'zoom']);
    });

    it('correctly sorts mx servers', () => {
        const dns = {...baseDns, mx:
                [
                    { exchange: 'slow-mail.example.com', priority: 20 },
                    { exchange: 'priority-mail.example.com', priority: 5 },
                    { exchange: 'mail.example.com', priority: 10 }
                ]
        };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.mx).toEqual(['priority-mail.example.com', 'mail.example.com', 'slow-mail.example.com']);
    });
});

describe('domainRows', () => {
    it('correctly parses domain rows', () => {
        const summary: DomainSummary = {
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

        const rows = domainRows(summary);

        expect(rows).toEqual([
            ['Domain', 'example.com'],
            ['Registered', '2010-05-01 (15 years ago)'],
            ['Expires', '2030-05-01'],
            ['Nameservers', 'NS1.EXAMPLE.COM, NS2.EXAMPLE.COM'],
            ['IPv4', '93.184.216.34, 192.0.2.10'],
            ['IPv6', '2607:f8b0:4009:81c::200e, 2001:db8::1'],
            ['Mail (MX)', 'mail.example.com'],
            ['SPF', 'v=spf1 include:_spf.example.com ~all'],
            ['DMARC', 'v=DMARC1; p=reject; rua=mailto:reports@example.com'],
            ['DMARC Policy', 'reject'],
            ['Services', 'google, facebook, docusign'],
        ])
    })

    it('correctly handles missing values', () => {
        const summary: DomainSummary = {
            domain: 'example.com',
            registered: null,
            ageYears: null,
            expires: null,
            nameservers: [],
            ipv4: [],
            ipv6: [],
            mx: [],
            spf: null,
            dmarc: null,
            dmarcPolicy: null,
            services: []
        };

        const rows = domainRows(summary);

        expect(rows).toEqual([
            ['Domain', 'example.com'],
            ['Registered', 'no registration date found'],
            ['Expires', 'no expiration date found'],
            ['Nameservers', 'no nameservers found'],
            ['IPv4', 'no IPv4 found'],
            ['IPv6', 'no IPv6 found'],
            ['Mail (MX)', 'no mail server found'],
            ['SPF', 'no SPF records found'],
            ['DMARC', 'no DMARC records found'],
            ['DMARC Policy', 'no DMARC policy found'],
            ['Services', 'no services found'],
        ]);
    });
});
