import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToJSON, validateBackupData, formatFileSize } from '../exportData';

describe('exportData utils', () => {
    describe('exportToJSON', () => {
        beforeEach(() => {
            // Mock DOM methods
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn(),
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
            global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
            global.URL.revokeObjectURL = vi.fn();
        });

        it('exports data and triggers download', () => {
            const data = {
                timestamp: new Date().toISOString(),
                themes: [],
                tasks: [],
                goals: [],
                gamification: {}
            };

            // This should not throw
            expect(() => exportToJSON(data)).not.toThrow();
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(document.body.appendChild).toHaveBeenCalled();
        });
    });

    describe('validateBackupData', () => {
        it('validates correct backup structure', () => {
            const validData = {
                themes: [],
                tasks: [],
                goals: [],
                gamification: { xp: 0, level: 1 }
            };

            const result = validateBackupData(validData);
            expect(result.valid).toBe(true);
        });

        it('detects missing required fields', () => {
            const invalidData = {
                themes: []
            };

            const result = validateBackupData(invalidData);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('campo "tasks" não encontrado');
        });

        it('validates that fields must be arrays', () => {
            const invalidData = {
                themes: 'not an array',
                tasks: [],
                goals: [],
                gamification: {}
            };

            const result = validateBackupData(invalidData);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('"themes" não é um array');
        });
    });

    describe('formatFileSize', () => {
        it('formats bytes correctly', () => {
            expect(formatFileSize(500)).toBe('500 B');
            expect(formatFileSize(1024)).toBe('1.0 KB');
            expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
        });

        it('handles edge cases', () => {
            expect(formatFileSize(0)).toBe('0 B');
            expect(formatFileSize(1023)).toBe('1023 B');
        });
    });
});
