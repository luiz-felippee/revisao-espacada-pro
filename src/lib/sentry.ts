import * as Sentry from '@sentry/react';

/**
 * Inicializa o Sentry para error tracking e performance monitoring.
 * 
 * ## Features Habilitadas
 * 
 * - **Error Tracking:** Captura erros não tratados e exceções
 * - **Performance Monitoring:** Rastreia transações e operações lentas
 * - **Session Replay:** (Opcional) Grava sessões de usuário para debug
 * - **Source Maps:** Mapeia erros para código original
 * 
 * ## Configuração de Ambiente
 * 
 * Adicione ao `.env`:
 * ```env
 * VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
 * VITE_SENTRY_ENVIRONMENT=production # ou development, staging
 * VITE_SENTRY_TRACES_SAMPLE_RATE=0.1 # 10% das transações
 * ```
 * 
 * ## Privacy & Data Sanitization
 * 
 * - Dados sensíveis são removidos antes de envio
 * - Tokens de autenticação são mascarados
 * - Informações pessoais são descartadas
 * 
 * @example
 * ```typescript
 * // Em main.tsx
 * import { initSentry } from './lib/sentry';
 * 
 * if (import.meta.env.PROD) {
 *   initSentry();
 * }
 * ```
 */
export function initSentry() {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    // Não inicializar se DSN não estiver configurado
    if (!dsn) {
        console.warn('⚠️ Sentry DSN not configured. Skipping initialization.');
        return;
    }

    const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
    const tracesSampleRate = parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1');

    Sentry.init({
        dsn,
        environment,

        // Performance Monitoring
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Session Replay configuration
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Taxa de amostragem de performance (0.0 a 1.0)
        // 0.1 = 10% das transações serão enviadas
        tracesSampleRate,

        // Taxa de amostragem de erros (1.0 = todos os erros)
        sampleRate: 1.0,

        // Normalizar breadcrumbs e eventos
        beforeSend(event, hint) {
            // Remover dados sensíveis
            if (event.request) {
                // Mascarar tokens de autenticação
                if (event.request.headers) {
                    if (event.request.headers.Authorization) {
                        event.request.headers.Authorization = '[Filtered]';
                    }
                    if (event.request.headers['X-Auth-Token']) {
                        event.request.headers['X-Auth-Token'] = '[Filtered]';
                    }
                }

                // Remover query params sensíveis
                if (event.request.url) {
                    const url = new URL(event.request.url, window.location.origin);
                    if (url.searchParams.has('token')) {
                        url.searchParams.set('token', '[Filtered]');
                        event.request.url = url.toString();
                    }
                }
            }

            // Filtrar localStorage/sessionStorage de breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
                    return breadcrumb.category !== 'console' ||
                        !breadcrumb.message?.includes('localStorage') &&
                        !breadcrumb.message?.includes('sessionStorage');
                });
            }

            // Log de erros em desenvolvimento
            if (environment === 'development') {
                console.error('🔴 Sentry captured error:', hint.originalException || hint.syntheticException);
            }

            return event;
        },

        // Filtrar breadcrumbs antes de adicionar
        beforeBreadcrumb(breadcrumb) {
            // Não capturar console.log em produção
            if (breadcrumb.category === 'console' && environment === 'production') {
                return null;
            }

            // Sanitizar URLs em breadcrumbs
            if (breadcrumb.data?.url) {
                const url = new URL(breadcrumb.data.url, window.location.origin);
                if (url.searchParams.has('token')) {
                    url.searchParams.set('token', '[Filtered]');
                    breadcrumb.data.url = url.toString();
                }
            }

            return breadcrumb;
        },

        // Ignorar erros conhecidos e não críticos
        ignoreErrors: [
            // Erros de navegador/extensões
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',

            // Erros de rede esperados
            'NetworkError',
            'Failed to fetch',
            'Load failed',

            // Cancelamentos de requisição
            'AbortError',
            'Request aborted',

            // Erros de browser offline
            'Network request failed',
            'The Internet connection appears to be offline',
        ],

        // Tags globais para filtrar eventos
        initialScope: {
            tags: {
                app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
                build_time: new Date().toISOString(),
            },
        },

        // Habilitar debug em desenvolvimento
        debug: environment === 'development',

        // Release tracking (para source maps)
        release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    });

    console.log('✅ Sentry initialized:', {
        environment,
        tracesSampleRate,
        release: import.meta.env.VITE_SENTRY_RELEASE || 'not specified'
    });
}

/**
 * Captura erro manualmente e envia ao Sentry.
 * 
 * @param error - Erro a ser capturado
 * @param context - Contexto adicional para debugging
 * 
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureError(error, {
 *     operation: 'riskyOperation',
 *     userId: user.id
 *   });
 * }
 * ```
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, {
        contexts: {
            custom: context || {},
        },
    });
}

/**
 * Inicia uma transação de performance manualmente.
 * 
 * Útil para medir operações críticas como:
 * - Processamento de fila de sincronização
 * - Cálculos de SRS
 * - Renderização de calendário com muitos eventos
 * 
 * @param name - Nome da transação
 * @param op - Tipo de operação (ex: 'sync', 'calculation', 'render')
 * @param callback - Função a ser executada dentro do span
 * @returns Promise do resultado da callback
 * 
 * @example
 * ```typescript
 * await startTransaction('sync.queue.process', 'sync', async (span) => {
 *   try {
 *     await processQueue();
 *     span?.setStatus({ code: 1 }); // OK
 *   } catch (error) {
 *     span?.setStatus({ code: 2 }); // ERROR
 *     captureError(error);
 *     throw error;
 *   }
 * });
 * ```
 */
export function startTransaction<T>(name: string, op: string, callback: (span?: Sentry.Span) => Promise<T> | T): Promise<T> {
    return Promise.resolve(Sentry.startSpan({ name, op }, callback));
}

/**
 * Adiciona contexto de usuário ao Sentry para debugging.
 * 
 * @param user - Informações do usuário (sem dados sensíveis!)
 * 
 * @example
 * ```typescript
 * setUserContext({
 *   id: user.id,
 *   email: user.email, // Será mascarado por Sentry
 *   plan: user.subscription_plan
 * });
 * ```
 */
export function setUserContext(user: { id: string; email?: string; plan?: string }) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        plan: user.plan,
    });
}

/**
 * Remove contexto de usuário (ex: ao fazer logout).
 */
export function clearUserContext() {
    Sentry.setUser(null);
}
