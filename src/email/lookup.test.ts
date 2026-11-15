import { describe, it, expect } from "vitest";
import { lookupEmail } from './lookup.js';
import { ScoutError } from '../errors.js';

describe('lookupEmail', () => {
    it('throws a ScoutError for an invalid email', async () => {
        await expect(lookupEmail('banana')).rejects.toThrow(ScoutError);
    });
});
