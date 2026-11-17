import { type RdapDomain, type RdapEvent } from './rdap.js';
import { type DnsRecords } from './dns.js';
import { type Row, row } from '../output.js';

export interface DomainSummary {
    domain: string;
    registered: string | null;
    ageYears: number | null;
    expires: string | null;
    nameservers: string[];
    ipv4: string[];
    ipv6: string[];
    mx: string[];
    spf: string | null;
    dmarc: string | null;
    dmarcPolicy: string | null;
    services: string[];
}

function getEventDate(events: RdapEvent[], action: string) {
    return events.find((e) => e.eventAction === action)?.eventDate;
}

function stripSuffix(name: string) {
    const suffixes = ['-domain-verification', '-site-verification', '-verification', '-smime-dv'];

    for (const suffix of suffixes) {
        if (name.endsWith(suffix)) {
            return name.slice(0, -suffix.length);
        }
    }
    return name;
}

function yearsSince(date: Date): number {
    const now = new Date();
    let years = now.getUTCFullYear() - date.getUTCFullYear();

    const anniversaryPast =
        now.getUTCMonth() > date.getUTCMonth() ||
        (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() >= date.getUTCDate());

    if (!anniversaryPast) {
        years -= 1;
    }

    return years;
}

export function summarizeDomain(domain: string, data: RdapDomain, dns: DnsRecords): DomainSummary {
    const registration = getEventDate(data.events, "registration");
    const expiration = getEventDate(data.events, "expiration");

    const serviceNames = dns.txt
        .filter((record) => record.includes('='))
        .filter((record) => !record.startsWith('v='))
        .map((record) => record.split('=')[0] ?? '')
        .map((name) => stripSuffix(name));

    const dmarc = dns.dmarc.find((record) => record.startsWith('v=DMARC1'));

    return {
        domain: domain,
        registered: registration?.substring(0, 10) ?? null,
        ageYears: registration ? yearsSince(new Date(registration)) : null,
        expires: expiration?.substring(0, 10) ?? null,
        nameservers: data.nameservers?.map((ns) => ns.ldhName) ?? [],
        ipv4: dns.a,
        ipv6: dns.aaaa,
        mx: dns.mx.toSorted((a, b) => a.priority - b.priority).map((record) => record.exchange),
        spf: dns.txt.find((record) => record.startsWith('v=spf1')) ?? null,
        dmarc: dmarc ?? null,
        dmarcPolicy: dmarc
            ?.split(';')
            .map((tag) => tag.trim())
            .find((tag) => tag.startsWith('p='))
            ?.slice(2) ?? null,
        services: [...new Set(serviceNames)].sort((a, b) => a.localeCompare(b)),
    };
}

export function domainRows(summary: DomainSummary): Row[] {
    return [
        ['Domain', summary.domain, 'title'],
        row('Registered', summary.registered && `${summary.registered} (${summary.ageYears} years ago)`, 'no registration date found'),
        row('Expires', summary.expires, 'no expiration date found'),
        row('Nameservers', summary.nameservers.join(', '), 'no nameservers found'),
        row('IPv4', summary.ipv4.join(', '), 'no IPv4 found'),
        row('IPv6', summary.ipv6.join(', '), 'no IPv6 found'),
        row('Mail (MX)', summary.mx.join(', '), 'no mail server found'),
        row('SPF', summary.spf, 'no SPF records found'),
        row('DMARC', summary.dmarc, 'no DMARC records found'),
        row('DMARC Policy', summary.dmarcPolicy, 'no DMARC policy found'),
        row('Services', summary.services.join(', '), 'no services found'),
    ];
}
