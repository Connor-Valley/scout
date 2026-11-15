import { expect, describe, it } from "vitest";
import { normalizeDomain } from './normalize.js'

describe('normalizeDomain', () => {
    it('leaves a good domain as is', () => {
        const domain = 'google.com';
        const result = normalizeDomain(domain);

        expect(result).toBe('google.com');
    });

    it('removes www from input', () => {
        const domain = 'www.google.com/';
        const result = normalizeDomain(domain);

        expect(result).toBe('google.com');
    });

    it('correctly removes scheme from input', () => {
        const domain = 'http://google.com';
        const result = normalizeDomain(domain);

        expect(result).toBe('google.com');
    })

    it('correctly normalizes url with scheme and www', () => {
        const domain = 'https://www.google.com';
        const result = normalizeDomain(domain);

        expect(result).toBe('google.com');
    });

    it('correctly normalizes full url', () => {
        const domain = 'https://www.google.com/search?q=hi'
        const result = normalizeDomain(domain);

        expect(result).toBe('google.com');
    });

    it('lowercases the input', () => {
        const domain = 'GOOGLE.COM';
        const result = normalizeDomain(domain);

        expect(result).toBe('google.com');
    });

    it('correctly handles bad input', () => {
        const domain = 'not a domain';
        const result = normalizeDomain(domain);

        expect(result).toBeNull();
    });

    it('correctly handles empty input', () => {
        const domain = '';
        const result = normalizeDomain(domain);

        expect(result).toBeNull();
    });

    it('rejects domains without a .', () => {
        const domain = 'google';
        const result = normalizeDomain(domain);

        expect(result).toBeNull();
    });

    it('returns null when the URL can\'t be parsed', () => {
        const domain = 'not a.domain';
        const result = normalizeDomain(domain);

        expect(result).toBeNull();
    });

    it('only strips www at the start', () => {
        const domain = 'mywww.site.com';
        const result = normalizeDomain(domain);

        expect(result).toBe('mywww.site.com');
    });

    it('rejects input whose only dot is in the path', () => {
        const domain = 'google/page.com';
        const result = normalizeDomain(domain);

        expect(result).toBeNull();
    });
});