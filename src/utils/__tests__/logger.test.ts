import { describe, it, expect, beforeEach } from 'vitest';
import { logger, syncLogger, authLogger, dbLogger } from '../logger';

describe('Logger Utility', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Mock console methods
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => { });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('logger.debug', () => {
        it('should log in development mode', () => {
            logger.debug('Test debug message');

            // In test env, assume DEV mode
            if (import.meta.env.DEV) {
                expect(consoleLogSpy).toHaveBeenCalled();
            }
        });

        it('should include data when provided', () => {
            const testData = { foo: 'bar' };
            logger.debug('Test with data', testData);

            if (import.meta.env.DEV) {
                expect(consoleLogSpy).toHaveBeenCalledWith(
                    expect.stringContaining('🔍'),
                    'Test with data',
                    testData
                );
            }
        });
    });

    describe('logger.warn', () => {
        it('should always log warnings', () => {
            logger.warn('Test warning');
            expect(consoleWarnSpy).toHaveBeenCalled();
        });
    });

    describe('logger.error', () => {
        it('should always log errors', () => {
            logger.error('Test error');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should include error object when provided', () => {
            const testError = new Error('Test error object');
            logger.error('Error occurred', testError);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('❌'),
                'Error occurred',
                testError
            );
        });
    });

    describe('Named loggers', () => {
        it('syncLogger should include [Sync] prefix', () => {
            syncLogger.info('Sync message');

            if (import.meta.env.DEV) {
                expect(consoleInfoSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[Sync]'),
                    'Sync message'
                );
            }
        });

        it('authLogger should include [Auth] prefix', () => {
            authLogger.info('Auth message');

            if (import.meta.env.DEV) {
                expect(consoleInfoSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[Auth]'),
                    'Auth message'
                );
            }
        });

        it('dbLogger should include [DB] prefix', () => {
            dbLogger.info('Database message');

            if (import.meta.env.DEV) {
                expect(consoleInfoSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[DB]'),
                    'Database message'
                );
            }
        });
    });

    describe('logger.group', () => {
        it('should group logs in development', () => {
            const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => { });
            const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => { });

            logger.group('Test Group', () => {
                logger.debug('Inside group');
            });

            if (import.meta.env.DEV) {
                expect(groupSpy).toHaveBeenCalledWith('Test Group');
                expect(groupEndSpy).toHaveBeenCalled();
            }

            groupSpy.mockRestore();
            groupEndSpy.mockRestore();
        });
    });
});
