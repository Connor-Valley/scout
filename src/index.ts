#!/usr/bin/env node
import { promises as dns, type MxRecord } from 'node:dns';

const inputType = process.argv[2];
const input = process.argv[3];

interface RdapEvent {
    eventAction: string;
    eventDate: string;
}

interface RdapDomain {
    ldhName: string;
    events: RdapEvent[];
    nameservers?: RdapNameserver[];
}

interface RdapNameserver {
    ldhName: string;

}

interface DomainSummary {
    domain: string;
    registered: string;
    expires: string;
    nameservers: string;
    address: string;
    mx: string;
    spf: string;
    services: string;
}

interface DnsRecords {
    a: string[];
    mx: MxRecord[];
    txt: string[];
}

function getEventDate(events: RdapEvent[], action: string) {
    return events.find((e) => e.eventAction === action)?.eventDate;
}

async function fetchDomain(domain: string): Promise<RdapDomain> {
    const url = `https://rdap.org/domain/${domain}`;
    let response: Response;
    try {
        response = await fetch(url, {
            headers: {
                'User-Agent': 'scout/0.1 (github.com/Connor-Valley/scout)',
                'Accept': 'application/rdap+json'
            }
        });
    } catch (error) {
        console.error("Client is offline");
        process.exit(1);
    }

    if (response.status === 404) {
        console.error("Domain not found");
        process.exit(1);
    } else if (!response.ok) {
        console.error("Domain lookup error:", response.status);
        process.exit(1);
    }

    return (await response.json()) as RdapDomain;
}

async function fetchDns(domain: string): Promise<DnsRecords> {
    const [a, mx, txt] = await Promise.all([
        dns.resolve4(domain).catch(() => []),
        dns.resolveMx(domain).catch(() => []),
        dns.resolveTxt(domain).catch(() => [])
    ]);

    return {
        a,
        mx,
        txt: txt.map((parts) => parts.join('')),
    };
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

function summarizeDomain(domain: string, data: RdapDomain, dns: DnsRecords): DomainSummary {
    const events = data.events;
    const registration = getEventDate(events, "registration");
    const expiration = getEventDate(events, "expiration");
    const nameservers = data.nameservers;

    let displayRegistrationDate;
    if (registration) {
        const registrationYear = new Date(registration).getFullYear();
        const nowYear = (new Date()).getFullYear();
        displayRegistrationDate = registration.substring(0, 10) + " " + `(${nowYear - registrationYear} years ago)`;
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

function printDomainSummary(summary: DomainSummary) {
    const rows: [string, string][] = [
        ['Domain', summary.domain],
        ['Registered', summary.registered],
        ['Expires', summary.expires],
        ['Nameservers', summary.nameservers],
        ['IPv4', summary.address],
        ['Mail (MX)', summary.mx],
        ['SPF', summary.spf],
        ['Services', summary.services],
    ];

    for (const [label, value] of rows) {
        console.log(`${label.padEnd(14)}${value}`);
    }
}


if (!inputType || !input) {
    console.error('Usage: scout <type> <input>');
    process.exit(1);
}

switch (inputType) {
    case '-d':
    case '--domain':
    case 'domain': {
        const [data, dns] = await Promise.all([fetchDomain(input), fetchDns(input)]);
        const summary = summarizeDomain(input, data, dns);
        printDomainSummary(summary);
        break;
    }
    default:
        console.error(`Unknown type: ${inputType}`);
        process.exit(1);
}
