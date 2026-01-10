/**
 * Performance Utilities Module
 * 
 * Utilitários avançados de otimização de performance para React
 * Complementam os hooks básicos em useOptimization.ts
 */

/**
 * Calcula um hash simples de uma string para uso em memoização
 * Usado para gerar keys estáveis para listas dinâmicas
 */
export function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Debounce function para uso fora de componentes React
 * @param func - Função a ser debounced
 * @param wait - Tempo de espera em ms
 * @returns Função debounced
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para uso fora de componentes React
 * @param func - Função a ser throttled
 * @param limit - Limite de tempo em ms
 * @returns Função throttled
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Verifica se dois objetos são shallow equal
 * Útil para otimização de re-renders
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (!obj1 || !obj2) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (obj1[key] !== obj2[key]) return false;
    }

    return true;
}

/**
 * Divide um array em chunks menores para processamento otimizado
 * Útil para renderização de listas grandes
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Memoiza o resultado de uma função cara baseada em argumentos
 * Cache simples para funções puras
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);

        // Limita o tamanho do cache para prevenir memory leak
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    }) as T;
}

/**
 * RequestAnimationFrame wrapper para otimizar animações
 * Garante que atualizações aconteçam no timing ideal do browser
 */
export function rafSchedule<T extends (...args: any[]) => void>(fn: T): T {
    let rafId: number | null = null;

    return ((...args: Parameters<T>) => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
            fn(...args);
            rafId = null;
        });
    }) as T;
}

/**
 * Batch de atualizações de estado para evitar re-renders múltiplos
 * Agrupa múltiplas chamadas em uma única atualização
 */
export class BatchUpdater {
    private updates: (() => void)[] = [];
    private rafId: number | null = null;

    add(update: () => void) {
        this.updates.push(update);

        if (this.rafId === null) {
            this.rafId = requestAnimationFrame(() => {
                this.flush();
            });
        }
    }

    flush() {
        const updates = this.updates.slice();
        this.updates = [];
        this.rafId = null;

        updates.forEach(update => update());
    }
}
