import {parsePhoneNumberFromString, type CountryCode, type PhoneNumberType} from 'libphonenumber-js/max';

export interface PhoneSummary {
    input: string;
    country: CountryCode | null;
    national: string;
    international: string;
    e164: string;
    isPossible: boolean;
    isValid: boolean;
    type: PhoneNumberType | null;
}

export function summarizePhone(input: string): PhoneSummary | null {
    const PHONE_CHARS = /^[\d\s+\-().]+$/;
    if (!PHONE_CHARS.test(input)) return null;

    const phone = parsePhoneNumberFromString(input, 'US');

    if (!phone) return null;

    return {
        input,
        country: phone.country ?? null,
        national: phone.formatNational(),
        international: phone.formatInternational(),
        e164: phone.number,
        isPossible: phone.isPossible(),
        isValid: phone.isValid(),
        type: phone.getType() ?? null,
    }
}

export function phoneRows(summary: PhoneSummary): [string, string][] {
    return [
        ['Input', summary.input],
        ['Country', summary.country ?? 'no country found'],
        ['National', summary.national],
        ['International', summary.international],
        ['E164', summary.e164],
        ['Possible', summary.isPossible ? 'Yes' : 'No'],
        ['Valid', summary.isValid ? 'Yes' : 'No'],
        ['Type', summary.type?.replaceAll('_', ' ').toLowerCase() ?? 'no type found']
    ]
}