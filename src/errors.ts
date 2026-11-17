import * as z from 'zod';
import { type Style } from './output.js';

export class ScoutError extends Error {
    override name = 'ScoutError';
}

export function handleError(error: unknown, debug: boolean | undefined, styleError: Style): never {
    if (error instanceof ScoutError) {
        console.error(styleError(error.message));
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
