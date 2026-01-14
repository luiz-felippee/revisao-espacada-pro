import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { ReviewNotificationService } from '../../../services/ReviewNotificationService';
import { cn } from '../../../lib/utils';

export const NotificationSettings = () => {
    const [config, setConfig] = useState(ReviewNotificationService.getConfig());
    const [hasPermission, setHasPermission] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Verificar permissão de notificação
        if ('Notification' in window) {
            setHasPermission(Notification.permission === 'granted');
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setHasPermission(permission === 'granted');

            if (permission === 'granted') {
                // Enviar notificação de teste
                new Notification('🎉 Notificações Ativadas!', {
                    body: 'Você receberá lembretes de revisões e tarefas pendentes.',
                    icon: '/vite.svg'
                });
            }
        }
    };

    const handleToggle = (key: 'morning' | 'afternoon' | 'evening' | 'enabled') => {
        const newConfig = { ...config, [key]: !config[key] };
        setConfig(newConfig);
        setIsSaving(true);

        ReviewNotificationService.saveConfig(newConfig);

        setTimeout(() => {
            setIsSaving(false);
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    Notificações de Revisão
                </h3>
                <p className="text-sm text-slate-400">
                    Configure lembretes automáticos para suas revisões e tarefas pendentes.
                </p>
            </div>

            {/* Permissão de Notificação */}
            {!hasPermission && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <BellOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-300 mb-2">
                                Permissão de Notificações Necessária
                            </p>
                            <p className="text-xs text-amber-400/70 mb-3">
                                Para receber lembretes automáticos, você precisa permitir notificações no navegador.
                            </p>
                            <button
                                onClick={requestPermission}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                Permitir Notificações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Controles */}
            <div className="space-y-3">
                {/* Master Toggle */}
                <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    config.enabled
                        ? "bg-blue-500/10 border-blue-500/20"
                        : "bg-slate-900/50 border-slate-800"
                )}>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                            {config.enabled ? (
                                <Check className="w-5 h-5 text-blue-400" />
                            ) : (
                                <X className="w-5 h-5 text-slate-500" />
                            )}
                            <div>
                                <p className="font-bold text-white text-sm">
                                    Notificações Automáticas
                                </p>
                                <p className="text-xs text-slate-400">
                                    {config.enabled ? 'Ativado' : 'Desativado'}
                                </p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() => handleToggle('enabled')}
                            className="toggle-checkbox hidden"
                        />
                        <div className={cn(
                            "relative w-12 h-6 rounded-full transition-colors",
                            config.enabled ? "bg-blue-500" : "bg-slate-700"
                        )}>
                            <div className={cn(
                                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                                config.enabled && "translate-x-6"
                            )} />
                        </div>
                    </label>
                </div>

                {/* Horários de Notificação */}
                {config.enabled && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                            Horários de Lembrete
                        </p>

                        {/* Manhã (9h) */}
                        <div className={cn(
                            "p-3 rounded-lg border transition-all",
                            config.morning
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-slate-900/50 border-slate-800"
                        )}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🌅</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">Manhã</p>
                                        <p className="text-xs text-slate-400">9:00 AM</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.morning}
                                    onChange={() => handleToggle('morning')}
                                    className="hidden"
                                />
                                <div className={cn(
                                    "w-10 h-5 rounded-full transition-colors",
                                    config.morning ? "bg-emerald-500" : "bg-slate-700"
                                )}>
                                    <div className={cn(
                                        "w-4 h-4 mt-0.5 ml-0.5 bg-white rounded-full transition-transform",
                                        config.morning && "translate-x-5"
                                    )} />
                                </div>
                            </label>
                        </div>

                        {/* Tarde (14h) */}
                        <div className={cn(
                            "p-3 rounded-lg border transition-all",
                            config.afternoon
                                ? "bg-amber-500/10 border-amber-500/20"
                                : "bg-slate-900/50 border-slate-800"
                        )}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">☀️</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">Tarde</p>
                                        <p className="text-xs text-slate-400">2:00 PM</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.afternoon}
                                    onChange={() => handleToggle('afternoon')}
                                    className="hidden"
                                />
                                <div className={cn(
                                    "w-10 h-5 rounded-full transition-colors",
                                    config.afternoon ? "bg-amber-500" : "bg-slate-700"
                                )}>
                                    <div className={cn(
                                        "w-4 h-4 mt-0.5 ml-0.5 bg-white rounded-full transition-transform",
                                        config.afternoon && "translate-x-5"
                                    )} />
                                </div>
                            </label>
                        </div>

                        {/* Noite (19h) */}
                        <div className={cn(
                            "p-3 rounded-lg border transition-all",
                            config.evening
                                ? "bg-indigo-500/10 border-indigo-500/20"
                                : "bg-slate-900/50 border-slate-800"
                        )}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🌙</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">Noite</p>
                                        <p className="text-xs text-slate-400">7:00 PM</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.evening}
                                    onChange={() => handleToggle('evening')}
                                    className="hidden"
                                />
                                <div className={cn(
                                    "w-10 h-5 rounded-full transition-colors",
                                    config.evening ? "bg-indigo-500" : "bg-slate-700"
                                )}>
                                    <div className={cn(
                                        "w-4 h-4 mt-0.5 ml-0.5 bg-white rounded-full transition-transform",
                                        config.evening && "translate-x-5"
                                    )} />
                                </div>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Indicator */}
            {isSaving && (
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm animate-in fade-in duration-200">
                    <Check className="w-4 h-4" />
                    <span>Configuração salva!</span>
                </div>
            )}

            {/* Informações */}
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">💡 Dica:</strong> Você receberá notificações automáticas nos horários selecionados se houver revisões ou tarefas pendentes para o dia. Além disso, você também pode configurar horários específicos para cada tarefa/tema nas configurações individuais.
                </p>
            </div>
        </div>
    );
};
