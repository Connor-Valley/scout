import { parseArgs } from 'node:util';

export const USAGE = 'Usage: scout -d <domain> | -p <phone> [--json]\nRun "scout --help" for more.';

const HELP_MESSAGE = `
scout - OSINT lookups for domains and phone numbers

Usage:
  scout -d <domain> [--json]
  scout -p <phone> [--json]

Examples:
  # Look up a domain
  scout -d google.com

  # Look up a phone number (quote it if it has spaces or parentheses)
  scout -p "+1 (248) 555-0142"

  # Get JSON output for scripting
  scout -d google.com --json

Flags:
  -d, --domain <domain>   Look up registration and DNS info for a domain
  -p, --phone <phone>     Look up info for a phone number
      --json              Print results as JSON
  -h, --help              Show this help
`.trim();

export function parseCliArgs() {
    try {
        const { values, positionals } = parseArgs({
            options: {
                domain: { type: 'string', short: 'd' },
                phone: { type: 'string', short: 'p' },
                json: { type: 'boolean' },
                help: { type: 'boolean', short: 'h' },
            },
            allowPositionals: true,
        });
        return { values, positionals };
    } catch(error) {
        if (error instanceof Error && 'code' in error && error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
            const flag = error.message.match(/'([^']+)'/)?.[1];
            console.error(`Unknown flag: ${flag}`);
        } else if (error instanceof Error) {
            console.error(error.message);
        }
        console.error(USAGE);
        process.exit(1);
    }
}

export function printHelp() : void {
    console.log(HELP_MESSAGE);
}