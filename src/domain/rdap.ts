export interface RdapEvent {
    eventAction: string;
    eventDate: string;
}

export interface RdapDomain {
    ldhName: string;
    events: RdapEvent[];
    nameservers?: RdapNameserver[];
}

export interface RdapNameserver {
    ldhName: string;
}

export async function fetchDomain(domain: string): Promise<RdapDomain> {
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