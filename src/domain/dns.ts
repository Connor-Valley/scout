import { promises as dns, type MxRecord } from 'node:dns';

export interface DnsRecords {
    a: string[];
    mx: MxRecord[];
    txt: string[];
}

export async function fetchDns(domain: string): Promise<DnsRecords> {
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