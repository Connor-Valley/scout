export function normalizeDomain(input: string): string | null {
    let urlObject;

    try {
        urlObject = new URL(input.includes('://') ? input : 'https://' + input);
    } catch {
        return null;
    }

    const hostname = urlObject.hostname;

    if (!hostname.includes('.')) {
        return null;
    }

    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;

}