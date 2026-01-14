import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePomodoroContext } from '../../context/PomodoroContext';
import { useStudy } from '../../context/StudyContext';
import { User, Timer, Save, Trash2, ShieldAlert, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { BackupSection } from '../../components/settings/BackupSection';
import { SyncHealthMonitor } from '../../components/SyncHealthMonitor';
import { NotificationSettings } from './components/NotificationSettings';
import { useOnboarding } from '../../hooks/useOnboarding';

export const Settings = () => {
    const { user, profile, updateProfile } = useAuth();
    const { settings, updateSettings } = usePomodoroContext();
    const { resetAccount, resetGamification, themes, tasks, goals, gamification: studyGamification, zenMode } = useStudy();
    const onboarding = useOnboarding();

    // Local state for form inputs
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [focusDuration, setFocusDuration] = useState(25);
    const [shortBreak, setShortBreak] = useState(5);
    const [longBreak, setLongBreak] = useState(15);
    const [strictMode, setStrictMode] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
    const [isResetGamificationModalOpen, setIsResetGamificationModalOpen] = useState(false);
    const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);


    useEffect(() => {
        if (profile?.display_name) setDisplayName((profile.display_name as string) ?? '');
        if (profile?.avatar_url) setAvatarUrl((profile.avatar_url as string) ?? '');
        if (settings) {
            setFocusDuration(settings.focusDuration);
            setShortBreak(settings.shortBreakDuration);
            setLongBreak(settings.longBreakDuration);
            setStrictMode(settings.strictMode || false);
        }
    }, [profile, settings]);

    const handleSaveProfile = async () => {
        await updateProfile({
            display_name: displayName,
            avatar_url: avatarUrl
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleSaveTimer = () => {
        updateSettings({
            focusDuration,
            shortBreakDuration: shortBreak,
            longBreakDuration: longBreak,
            strictMode
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">Configurações</h1>
                <p className="text-slate-400 mt-1">Personalize sua experiência de estudos.</p>
            </header>

            {/* Profile Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Perfil
                </h2>
                <Card className="bg-slate-900/50 border-slate-800">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* 1. Avatar Column */}
                        <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
                                    {profile?.avatar_url || avatarUrl ? (
                                        <img
                                            src={avatarUrl || (profile?.avatar_url as string) || ''}
                                            alt="Profile"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500">
                                            {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Overlay for Upload */}
                                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm cursor-pointer border-2 border-white/20">
                                    <ImageUpload value={avatarUrl} onChange={setAvatarUrl} />
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Foto de Perfil</span>
                        </div>

                        {/* 2. Info Column */}
                        <div className="flex-1 space-y-5 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        Nome de Exibição
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                                        placeholder="Como você quer ser chamado?"
                                    />
                                </div>

                                <div className="space-y-1.5 opacity-60 pointer-events-none select-none">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        Email (Não editável)
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.email}
                                        readOnly
                                        className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 w-full cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={!displayName.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Timer Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-amber-400" />
                    Foco & Pomodoro
                </h2>
                <Card className="bg-slate-900/50 border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Foco (min)</label>
                            <input
                                type="number"
                                value={focusDuration}
                                onChange={(e) => setFocusDuration(Number(e.target.value))}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white w-full font-mono text-lg focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Pausa Curta (min)</label>
                            <input
                                type="number"
                                value={shortBreak}
                                onChange={(e) => setShortBreak(Number(e.target.value))}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white w-full font-mono text-lg focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Pausa Longa (min)</label>
                            <input
                                type="number"
                                value={longBreak}
                                onChange={(e) => setLongBreak(Number(e.target.value))}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white w-full font-mono text-lg focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Modo Strict</label>
                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={() => setStrictMode(!strictMode)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${strictMode ? 'bg-amber-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${strictMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-xs text-slate-400">
                                    {strictMode ? 'Ativado (Esconde Menu)' : 'Desativado'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveTimer}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Atualizar Timer
                        </button>
                    </div>
                </Card>
            </section>

            {/* Notification Settings Section */}
            <section className="space-y-4">
                <Card className="bg-slate-900/50 border-slate-800">
                    <NotificationSettings />
                </Card>
            </section>

            {/* Tutorial/Onboarding Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-purple-400" />
                    Tutorial Guiado
                </h2>
                <Card className="bg-slate-900/50 border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-200">Rever Tour de Introdução</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Faça um tour guiado pelas principais funcionalidades do sistema.
                            </p>
                        </div>
                        <button
                            onClick={onboarding.resetOnboarding}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                        >
                            <Compass className="w-4 h-4" />
                            Iniciar Tutorial
                        </button>
                    </div>
                </Card>
            </section>

            {/* Sync Diagnostics Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    Diagnóstico de Sincronização
                </h2>
                <Card className="bg-slate-900/50 border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-200">Verificar Sincronização de Dados</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Diagnostique problemas com salvamento e sincronização dos seus dados com o Supabase.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsDiagnosticModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Executar Diagnóstico
                        </button>
                    </div>
                </Card>
            </section>

            {/* Data Management Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-emerald-400" />
                    Dados e Backup
                </h2>
                <BackupSection />
            </section>

            {/* Danger Zone */}
            <section className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Zona de Perigo
                </h2>
                <Card className="bg-red-950/10 border-red-900/30 border-dashed">
                    <div className="flex flex-col gap-6">
                        {/* Reset Gamification */}
                        <div className="flex items-center justify-between pb-6 border-b border-red-900/30">
                            <div>
                                <h3 className="font-bold text-red-200">Resetar Gamificação</h3>
                                <p className="text-xs text-red-300/60 mt-1">
                                    Zera seu Nível, XP e Conquistas, mas <span className="text-red-300 font-bold">MANTÉM</span> seus temas e tarefas.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsResetGamificationModalOpen(true)}
                                className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Resetar XP
                            </button>
                        </div>

                        {/* Reset All */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-red-200">Zerar Tudo (Começar do Zero)</h3>
                                <p className="text-xs text-red-300/60 mt-1">
                                    Apaga permanentemente: <span className="font-bold text-red-400">Metas, Calendário e Tarefas</span>.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDangerModalOpen(true)}
                                className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Zerar Tudo
                            </button>
                        </div>
                    </div>
                </Card>
            </section>

            {isSaved && (
                <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 font-bold animate-in slide-in-from-bottom-5 fade-in">
                    Alterações salvas!
                </div>
            )}

            <ConfirmationModal
                isOpen={isDangerModalOpen}
                onClose={() => setIsDangerModalOpen(false)}
                onConfirm={() => {
                    resetAccount();
                    setIsDangerModalOpen(false);
                }}
                title="Zerar Tudo?"
                description="Você está prestes a apagar TODAS as suas Metas, Itens do Calendário e Tarefas. Esta ação é irreversível. Tem certeza que deseja recomeçar do zero?"
                confirmText="Sim, Zerar Tudo"
                type="danger"
            />

            <ConfirmationModal
                isOpen={isResetGamificationModalOpen}
                onClose={() => setIsResetGamificationModalOpen(false)}
                onConfirm={async () => {
                    await resetGamification();
                    setIsResetGamificationModalOpen(false);
                }}
                title="Resetar Apenas Gamificação?"
                description="Você voltará para o Nível 1 com 0 XP. Suas conquistas serão bloqueadas novamente. Seus temas e tarefas NÃO serão apagados."
                confirmText="Sim, Zerar meu XP"
                type="danger"
            />

            {/* Sync Health Monitor Modal */}
            <SyncHealthMonitor
                isOpen={isDiagnosticModalOpen}
                onClose={() => setIsDiagnosticModalOpen(false)}
            />
        </div>
    );
};
