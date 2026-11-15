import { normalizeDomain } from '../domain/normalize.js';

export interface ParsedEmail {
    email: string;
    local: string;
    domain: string;
}

export function parseEmail(email: string): ParsedEmail | null {
    const trimmed = email.trim();
    const [local, domain, ...rest] = trimmed.split('@');

    if (!local || !domain || rest.length > 0) return null;

    const normalized = normalizeDomain(domain);
    if (!normalized) return null;

    return {
        email: `${local}@${normalized}`,
        local: local,
        domain: normalized,
    }
}
