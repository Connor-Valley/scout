import { type RdapDomain, type RdapEvent } from './rdap.js';
import { type DnsRecords } from './dns.js';

export interface DomainSummary {
    domain: string;
    registered: string | null;
    ageYears: number | null;
    expires: string | null;
    nameservers: string[];
    ipv4: string[];
    mx: string[];
    spf: string | null;
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
    let years = now.getFullYear() - date.getFullYear();

    const anniversaryPast =
        now.getMonth() > date.getMonth() ||
        (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

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

    return {
        domain: domain,
        registered: registration?.substring(0, 10) ?? null,
        ageYears: registration ? yearsSince(new Date(registration)) : null,
        expires: expiration?.substring(0, 10) ?? null,
        nameservers: data.nameservers?.map((ns) => ns.ldhName) ?? [],
        ipv4: dns.a,
        mx: dns.mx.map((record) => record.exchange),
        spf: dns.txt.find((record) => record.startsWith('v=spf1')) ?? null,
        services: [...new Set(serviceNames)].sort((a, b) => a.localeCompare(b)),
    };
}

export function domainRows(summary: DomainSummary): [string, string][] {
    const registered = summary.registered
        ? `${summary.registered} (${summary.ageYears} years ago)`
        : 'no registration date found';

    return [
        ['Domain', summary.domain],
        ['Registered', registered],
        ['Expires', summary.expires ?? 'no expiration date found'],
        ['Nameservers', summary.nameservers.join(', ') || 'no nameservers found'],
        ['IPv4', summary.ipv4[0] || 'no ip address found'],
        ['Mail (MX)', summary.mx[0] || 'no mail server found'],
        ['SPF', summary.spf ?? 'no SPF records found'],
        ['Services', summary.services.join(', ') || 'no services found'],
    ];
}