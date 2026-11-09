import { describe, it, expect, vi, afterEach } from 'vitest';
import { summarizeDomain } from './summary.js';
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
    a: ['93.184.216.34'],
    mx: [{ exchange: 'mail.example.com', priority: 10 }],
    txt: [
        'v=spf1 include:_spf.example.com ~all',      // SPF, should be excluded from services
        'google-site-verification=abc123',           // suffix to strip
        'google-site-verification=def456',           // duplicate, should be deduped
        'facebook-domain-verification=xyz789',       // different suffix
        'docusign=11111111-2222',                    // no suffix at all
        'randomtoken12345',                          // no "=", should be ignored
    ],
};

afterEach(() => vi.useRealTimers());

describe('summarizeDomain', () => {
    it('correctly summarizes a domain', () => {
        vi.setSystemTime(date)
        const summary = summarizeDomain('example.com', baseRdap, baseDns);

        expect(summary).toEqual({
            domain: 'example.com',
            registered: '2010-05-01 (15 years ago)',
            expires: '2030-05-01',
            nameservers: 'NS1.EXAMPLE.COM',
            address: '93.184.216.34',
            mx: 'mail.example.com',
            spf: 'v=spf1 include:_spf.example.com ~all',
            services: 'google, facebook, docusign'
        })
    });

    it('correctly handles after anniversary dates', () => {
       const date = new Date(2026, 5, 1);
       vi.setSystemTime(date);
       const summary = summarizeDomain('example.com', baseRdap, baseDns);

       expect(summary.registered).toEqual('2010-05-01 (16 years ago)');
    });

    it('uses a fallback when there are no nameservers', () => {
        const rdap = { ...baseRdap, nameservers: []};
        const summary = summarizeDomain('example.com', rdap, baseDns);

        expect(summary.nameservers).toBe('no nameservers found');
    });

    it('uses a fallback when nameservers is undefined', () => {
        const rdap = { ...baseRdap, nameservers: undefined };
        const summary = summarizeDomain('example.com', rdap, baseDns);

        expect(summary.nameservers).toBe('no nameservers found');
    })

    it('uses a fallback when there are no events', () => {
        const rdap = { ...baseRdap, events: [] };
        const summary = summarizeDomain('example.com', rdap, baseDns);

        expect(summary.registered).toBe('no registration date found');
        expect(summary.expires).toBe('no expiration date found');
    });

    it('uses a fallback when there is no ip address', () => {
        const dns = { ...baseDns, a: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.address).toBe('no ip address found');
    });

    it('uses a fallback when there is no mail server', () => {
        const dns = { ...baseDns, mx: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.mx).toBe('no mail server found');
    });

    it('uses a fallback when there are no services', () => {
        const dns = { ...baseDns, txt: [] };
        const summary = summarizeDomain('example.com', baseRdap, dns);

        expect(summary.spf).toBe('no spf records found');
        expect(summary.services).toBe('no services found');
    });

    it('correctly strips suffixes from services', () => {
        const summary = summarizeDomain('example.com', baseRdap, baseDns);

        expect(summary.services).toBe('google, facebook, docusign');
    });
});