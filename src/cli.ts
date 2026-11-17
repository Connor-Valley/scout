import { parseArgs } from 'node:util';

export const USAGE = 'Usage: scout -d <domain> | -p <phone> | -e <address> [--json]\nRun "scout --help" for more.';

const HELP_MESSAGE = `
scout - OSINT lookups for domains, phone numbers, and emails

Usage:
  scout -d <domain> [--json]
  scout -p <phone> [--json]
  scout -e <address> [--json]

Examples:
  # Look up a domain
  scout -d google.com

  # Look up a phone number (quote it if it has spaces or parentheses)
  scout -p "+1 (502) 555-0142"

  # Look up an email address
  scout -e test@example.com

  # Get JSON output for scripting
  scout -d google.com --json

Flags:
  -d, --domain <domain>   Look up registration and DNS info for a domain
  -p, --phone <phone>     Look up info for a phone number
  -e, --email <address>   Look up info for an email address
      --json              Print results as JSON
      --debug             Print full error details on failure
      --no-color          Print results without colors
  -h, --help              Show this help
`.trim();

export function parseCliArgs() {
    try {
        const { values, positionals } = parseArgs({
            options: {
                domain: { type: 'string', short: 'd' },
                phone: { type: 'string', short: 'p' },
                email: { type: 'string', short: 'e' },
                json: { type: 'boolean' },
                help: { type: 'boolean', short: 'h' },
                debug: { type: 'boolean' },
                'no-color': {type: 'boolean' },
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
