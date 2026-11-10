import * as z from "zod";

const RdapEventSchema = z.object({
    eventAction: z.string(),
    eventDate: z.string(),
});

export type RdapEvent = z.infer<typeof RdapEventSchema>;

const RdapNameserverSchema = z.object({
    ldhName: z.string(),
});

const RdapDomainSchema = z.object({
    ldhName: z.string(),
    events: z.array(RdapEventSchema),
    nameservers: z.array(RdapNameserverSchema).optional(),
});

export type RdapDomain = z.infer<typeof RdapDomainSchema>;

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

    const json = await response.json();
    const result = RdapDomainSchema.safeParse(json);

    if (!result.success) {
        console.error("Unexpected result from Rdap:\n", z.prettifyError(result.error));
        process.exit(1);
    }

    return result.data;
}