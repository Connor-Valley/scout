import { fetchDomain } from './rdap.js';
import { fetchDns } from './dns.js';
import { normalizeDomain } from './normalize.js'
import { summarizeDomain, type DomainSummary } from "./summary.js";
import {ScoutError} from "../errors.js";

export async function lookupDomain(domain: string): Promise<DomainSummary> {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) throw new ScoutError(`Not a valid domain: ${domain}`);

    const [data, dns] = await Promise.all([fetchDomain(normalizedDomain), fetchDns(normalizedDomain)]);
    return summarizeDomain(normalizedDomain, data, dns);
}