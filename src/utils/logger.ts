/**
 * Logger Utility
 * 
 * Provides safe logging that only outputs in development mode.
 * In production, logs are suppressed to avoid console pollution and potential security issues.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
    prefix?: string;
    emoji?: string;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;

    /**
     * Debug log - only in development
     */
    debug(message: string, data?: unknown, options?: LoggerOptions): void {
        if (!this.isDevelopment) return;

        const prefix = this.formatPrefix('debug', options);
        if (data !== undefined) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }

    /**
     * Info log - only in development
     */
    info(message: string, data?: unknown, options?: LoggerOptions): void {
        if (!this.isDevelopment) return;

        const prefix = this.formatPrefix('info', options);
        if (data !== undefined) {
            console.info(prefix, message, data);
        } else {
            console.info(prefix, message);
        }
    }

    /**
     * Warning log - shows in production
     */
    warn(message: string, data?: unknown, options?: LoggerOptions): void {
        const prefix = this.formatPrefix('warn', options);
        if (data !== undefined) {
            console.warn(prefix, message, data);
        } else {
            console.warn(prefix, message);
        }
    }

    /**
     * Error log - shows in production
     */
    error(message: string, error?: unknown, options?: LoggerOptions): void {
        const prefix = this.formatPrefix('error', options);
        if (error !== undefined) {
            console.error(prefix, message, error);
        } else {
            console.error(prefix, message);
        }
    }

    /**
     * Group logs together (only in development)
     */
    group(label: string, callback: () => void): void {
        if (!this.isDevelopment) {
            callback();
            return;
        }

        console.group(label);
        callback();
        console.groupEnd();
    }

    /**
     * Format log prefix with emoji and level
     */
    private formatPrefix(level: LogLevel, options?: LoggerOptions): string {
        const emojis: Record<LogLevel, string> = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌'
        };

        const emoji = options?.emoji || emojis[level];
        const prefix = options?.prefix || '';

        return `${emoji} ${prefix}`.trim();
    }
}

// Export singleton instance
export const logger = new Logger();

// Named exports for specific use cases
export const syncLogger = {
    debug: (msg: string, data?: unknown) => logger.debug(msg, data, { prefix: '[Sync]', emoji: '🔄' }),
    info: (msg: string, data?: unknown) => logger.info(msg, data, { prefix: '[Sync]', emoji: '🔄' }),
    warn: (msg: string, data?: unknown) => logger.warn(msg, data, { prefix: '[Sync]', emoji: '🔄' }),
    error: (msg: string, error?: unknown) => logger.error(msg, error, { prefix: '[Sync]', emoji: '🔄' })
};

export const authLogger = {
    debug: (msg: string, data?: unknown) => logger.debug(msg, data, { prefix: '[Auth]', emoji: '🔐' }),
    info: (msg: string, data?: unknown) => logger.info(msg, data, { prefix: '[Auth]', emoji: '🔐' }),
    warn: (msg: string, data?: unknown) => logger.warn(msg, data, { prefix: '[Auth]', emoji: '🔐' }),
    error: (msg: string, error?: unknown) => logger.error(msg, error, { prefix: '[Auth]', emoji: '🔐' })
};

export const dbLogger = {
    debug: (msg: string, data?: unknown) => logger.debug(msg, data, { prefix: '[DB]', emoji: '💾' }),
    info: (msg: string, data?: unknown) => logger.info(msg, data, { prefix: '[DB]', emoji: '💾' }),
    warn: (msg: string, data?: unknown) => logger.warn(msg, data, { prefix: '[DB]', emoji: '💾' }),
    error: (msg: string, error?: unknown) => logger.error(msg, error, { prefix: '[DB]', emoji: '💾' })
};
