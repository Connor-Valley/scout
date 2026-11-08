#!/usr/bin/env node

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

function summarizeDomain(domain: string, data: RdapDomain): DomainSummary {
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

    return {
        domain: domain,
        registered: displayRegistrationDate,
        expires: displayExpirationDate,
        nameservers: displayNameservers,
    };
}

function printDomainSummary(summary: DomainSummary) {
    console.log(`\nDomain: ${summary.domain}\nRegistered: ${summary.registered}\nExpires:  ${summary.expires}\nNameservers: ${summary.nameservers}`);
}


if (!inputType || !input) {
    console.error('Usage: scout <type> <input>');
    process.exit(1);
}

switch (inputType) {
    case '-d':
    case '--domain':
    case 'domain': {
        const data = await fetchDomain(input);
        const summary = summarizeDomain(input, data);
        printDomainSummary(summary);
        break;
    }
    default:
        console.error(`Unknown type: ${inputType}`);
        process.exit(1);
}
