import pino from 'pino';

/**
 * Configure Pino logger based on environment.
 * Development: Pretty printing with colors
 * Production: JSON format for structured logging
 */
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
	level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
	transport: isDevelopment
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'HH:MM:ss Z',
					ignore: 'pid,hostname',
				},
			}
		: undefined,
});

