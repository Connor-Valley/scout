import { describe, it, expect } from 'vitest';
import { summarizePhone, phoneRows, type PhoneSummary } from './summary.js'

describe('summarizePhone', () => {
   it('correctly summarizes a US phone number with country code', () => {
       const input = '+1 502 555 5555';
       const result = summarizePhone(input);

       expect(result).toMatchObject({
           country: 'US',
           isValid: true,
           national: '(502) 555-5555',
           international: '+1 502 555 5555',
           e164: '+15025555555'
       });
   });

   it('correctly uses fallback country when no country code is provided', () => {
       const input = '502 555 5555';
       const result = summarizePhone(input);

       expect(result).toMatchObject({ country: 'US', isValid: true });
   });

    it('correctly summarizes a GB phone number', () => {
        const input = '+44 20 7946 0958';
        const result = summarizePhone(input);

        expect(result).toMatchObject({ country: 'GB', isValid: true });
    });

    it('correctly handles a parsable invalid number', () => {
        const input = '502555';
        const result = summarizePhone(input);

        expect(result).toMatchObject({ country: null, isValid: false });
    });

    it('correctly handles invalid input', () => {
        const input = 'abc123';
        const result = summarizePhone(input);

        expect(result).toBeNull();
    });
});

describe('phoneRows', () => {
    const baseSummary: PhoneSummary = {
        input: '+1 502 555 5555',
        country: 'US',
        national: '(502) 555-5555',
        international: '+1 502 555 5555',
        e164: '+15025555555',
        isPossible: true,
        isValid: true,
        type: "FIXED_LINE_OR_MOBILE",
    };

   it('correctly builds rows for valid phone', () => {
      const rows = phoneRows(baseSummary);

      expect(rows).toEqual([
          ['Input', '+1 502 555 5555'],
          ['Country', 'US'],
          ['National', '(502) 555-5555'],
          ['International', '+1 502 555 5555'],
          ['E164', '+15025555555'],
          ['Possible', 'Yes'],
          ['Valid', 'Yes'],
          ['Type', 'fixed line or mobile']
      ]);
   });

   it('correctly handles missing/null data', () => {
       const summary: PhoneSummary = {
           ...baseSummary,
           country: null,
           isPossible: false,
           isValid: false,
           type: null,
       };

       const rows = phoneRows(summary);

       expect(rows).toEqual([
           ['Input', '+1 502 555 5555'],
           ['Country', 'no country found'],
           ['National', '(502) 555-5555'],
           ['International', '+1 502 555 5555'],
           ['E164', '+15025555555'],
           ['Possible', 'No'],
           ['Valid', 'No'],
           ['Type', 'no type found']
       ]);
   })
});