import { promises as dns, type MxRecord } from 'node:dns';

export interface DnsRecords {
    a: string[];
    mx: MxRecord[];
    txt: string[];
    dmarc: string[];
}

export async function fetchDns(domain: string): Promise<DnsRecords> {
    const [a, mx, txt, dmarcTxt] = await Promise.all([
        dns.resolve4(domain).catch(() => []),
        dns.resolveMx(domain).catch(() => []),
        dns.resolveTxt(domain).catch(() => []),
        dns.resolveTxt(`_dmarc.${domain}`).catch(() => []),
    ]);

    return {
        a,
        mx,
        txt: txt.map((parts) => parts.join('')),
        dmarc: dmarcTxt.map((parts) => parts.join('')),
    };
}