import { describe, it, expect } from 'vitest';
import { parseEmail } from './parse.js';

describe('parseEmail', () => {
    it('returns null when no @ sign', () => {
        const email = 'localdomain.com';
        const result = parseEmail(email);

        expect(result).toBeNull();
    });

    it('returns null on double @ sign', () => {
        const email = 'local@d@domain.com';
        const result = parseEmail(email);

        expect(result).toBeNull();
    });

    it('returns null on empty local', () => {
        const email = '@domain.com';
        const result = parseEmail(email);

        expect(result).toBeNull();
    });

    it('returns null on empty domain', () => {
        const email = 'local@';
        const result = parseEmail(email);

        expect(result).toBeNull();
    });

    it('returns null on a bad domain', () => {
        const email = 'local@google/page.com';
        const result = parseEmail(email);

        expect(result).toBeNull();
    });

    it('normalizes domain and leaves local alone', () => {
        const email = 'Local@DOMAIN.com';
        const result = parseEmail(email);

        expect(result).toEqual({
            email: 'Local@domain.com',
            local: 'Local',
            domain: 'domain.com'
        });
    });

    it('cleans up whitespace around email', () => {
        const email = '   local@domain.com  ';
        const result = parseEmail(email);

        expect(result).toEqual({
            email: 'local@domain.com',
            local: 'local',
            domain: 'domain.com'
        });
    });
});
