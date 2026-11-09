import { type RdapDomain, type RdapEvent } from './rdap.js';
import { type DnsRecords } from './dns.js';

export interface DomainSummary {
    domain: string;
    registered: string;
    expires: string;
    nameservers: string;
    address: string;
    mx: string;
    spf: string;
    services: string;
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
    const events = data.events;
    const registration = getEventDate(events, "registration");
    const expiration = getEventDate(events, "expiration");
    const nameservers = data.nameservers;

    let displayRegistrationDate;
    if (registration) {
        displayRegistrationDate = registration.substring(0, 10) + " " + `(${yearsSince(new Date(registration))} years ago)`;
    } else {
        displayRegistrationDate = "no registration date found"
    }
    const displayExpirationDate = expiration ? expiration.substring(0, 10) : "no expiration date found";
    const displayNameservers = nameservers?.map((ns) => ns.ldhName).join(', ') || "no nameservers found";

    const address = dns.a[0] ?? 'no ip address found';
    const mx = dns.mx[0]?.exchange ?? 'no mail server found';
    const spf = dns.txt.find((record) => record.startsWith('v=spf1')) ?? 'no spf records found';
    const serviceNames = dns.txt
        .filter((record) => record.includes('='))
        .filter((record) => !record.startsWith('v='))
        .map((record) => record.split('=')[0] ?? '')
        .map((name) => stripSuffix(name));

    const services = [...new Set(serviceNames)].join(', ') || 'no services found';

    return {
        domain: domain,
        registered: displayRegistrationDate,
        expires: displayExpirationDate,
        nameservers: displayNameservers,
        address: address,
        mx: mx,
        spf: spf,
        services: services,
    };
}

export function domainRows(summary: DomainSummary): [string, string][] {
     return [
        ['Domain', summary.domain],
        ['Registered', summary.registered],
        ['Expires', summary.expires],
        ['Nameservers', summary.nameservers],
        ['IPv4', summary.address],
        ['Mail (MX)', summary.mx],
        ['SPF', summary.spf],
        ['Services', summary.services],
    ];
}