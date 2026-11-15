import { describe, it, expect } from "vitest";
import { lookupDomain } from './lookup.js';
import { ScoutError } from '../errors.js';

describe('lookupDomain', () => {
    it('throws a ScoutError for an invalid domain', async () => {
        await expect(lookupDomain('banana')).rejects.toThrow(ScoutError);
    });
});
