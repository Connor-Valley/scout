import * as z from "zod";
import { ScoutError } from "../errors.js";

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
        throw new ScoutError("Couldn't reach the lookup service. Check your connection.", { cause: error });
    }

    if (response.status === 404) {
        throw new ScoutError(`Domain not found: ${domain}`);
    } else if (!response.ok) {
        throw new ScoutError(`Domain lookup error (HTTP: ${response.status})`);
    }

    const json = await response.json();
    const result = RdapDomainSchema.safeParse(json);

    if (!result.success) {
        throw new ScoutError("Unexpected result from RDAP", { cause: result.error });
    }

    return result.data;
}