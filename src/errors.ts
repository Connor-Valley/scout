import * as z from 'zod';

export class ScoutError extends Error {
    override name = 'ScoutError';
}

export function handleError(error: unknown, debug: boolean | undefined): never {
    if (error instanceof ScoutError) {
        console.error(error.message);
        if (debug && error.cause) {
            console.error('\nCause:');
            if (error.cause instanceof z.ZodError) {
                console.error(z.prettifyError(error.cause));
            } else {
                console.error(error.cause);
            }
        }
        process.exit(1);
    }
    throw error;
}
