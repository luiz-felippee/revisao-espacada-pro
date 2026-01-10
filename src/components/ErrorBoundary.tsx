import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Home, Bug } from 'lucide-react';
import { captureError } from '../lib/sentry';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to console with full details
        console.error('🚨 Error Boundary Caught:', {
            error,
            errorInfo,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        // Update state with error info
        this.setState({
            error,
            errorInfo
        });

        // Send to Sentry
        captureError(error, {
            componentStack: errorInfo.componentStack
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleCopyError = () => {
        const errorDetails = {
            message: this.state.error?.message,
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
            timestamp: new Date().toISOString()
        };

        navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
        alert('Detalhes do erro copiados para a área de transferência!');
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isDev = import.meta.env.DEV;

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        {/* Error Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-lg">
                            {/* Icon */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center animate-pulse">
                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-black text-white text-center mb-2">
                                Ops! Algo deu errado
                            </h1>
                            <p className="text-slate-400 text-center mb-8">
                                Não se preocupe, seus dados estão seguros. Tente uma das opções abaixo:
                            </p>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={this.handleReset}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Tentar Novamente
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
                                >
                                    <Home className="w-5 h-5" />
                                    Ir para Início
                                </button>

                                <button
                                    onClick={this.handleReload}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Recarregar Página
                                </button>

                                <button
                                    onClick={this.handleCopyError}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
                                >
                                    <Copy className="w-5 h-5" />
                                    Copiar Erro
                                </button>
                            </div>

                            {/* Error Details (Tempoary Debug for Production) */}
                            {this.state.error && (
                                <details className="mt-6">
                                    <summary className="cursor-pointer text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                                        <Bug className="w-4 h-4" />
                                        Detalhes do Erro (Dev)
                                    </summary>
                                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <div className="mb-3">
                                            <p className="text-red-400 font-bold text-sm mb-1">Mensagem:</p>
                                            <p className="text-white text-sm">{this.state.error.message}</p>
                                        </div>

                                        {this.state.error.stack && (
                                            <div>
                                                <p className="text-red-400 font-bold text-sm mb-1">Stack Trace:</p>
                                                <pre className="text-xs text-slate-300 overflow-auto max-h-64 whitespace-pre-wrap">
                                                    {this.state.error.stack}
                                                </pre>
                                            </div>
                                        )}

                                        {this.state.errorInfo?.componentStack && (
                                            <div className="mt-3">
                                                <p className="text-red-400 font-bold text-sm mb-1">Component Stack:</p>
                                                <pre className="text-xs text-slate-300 overflow-auto max-h-64 whitespace-pre-wrap">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Help Text */}
                            <p className="text-slate-500 text-xs text-center mt-6">
                                Se o problema persistir, entre em contato com o suporte.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
