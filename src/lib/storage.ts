export class StorageAdapter {
    private namespace: string;

    constructor(namespace: string = '') {
        this.namespace = namespace;
    }

    private getKey(key: string): string {
        return this.namespace ? `${this.namespace}_${key}` : key;
    }

    getItem<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = window.localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading key "${key}":`, error);
            return defaultValue;
        }
    }

    setItem<T>(key: string, value: T): void {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting key "${key}":`, error);
        }
    }

    removeItem(key: string): void {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(this.getKey(key));
        } catch (error) {
            console.warn(`Error removing key "${key}":`, error);
        }
    }

    // Update the namespace dynamically (e.g. when user switches)
    setNamespace(namespace: string) {
        this.namespace = namespace;
    }
}

// Singleton instance for global/guest usage if needed, 
// though we will likely instantiate per-user in Context.
export const globalStorage = new StorageAdapter();
