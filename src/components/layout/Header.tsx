import React from 'react';
import {
    CheckSquare,
    Target,
    BookOpen,
    Menu,
    LogOut,
    Cloud,
    CloudOff,
    RefreshCw,
    AlertCircle,
    Clock,
    Eye,
    Settings,
    EyeOff,
    X,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface HeaderProps {
    isPWA: boolean;
    isIOS: boolean;
    safeAreaTopClass: string;
    isHeaderVisible: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    zenMode: boolean;
    toggleZenMode: () => void;
    setIsMissionModalOpen: (isOpen: boolean) => void;
    setIsSummaryModalOpen: (isOpen: boolean) => void;
    setIsTaskModalOpen: (isOpen: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsThemeModalOpen: (isOpen: boolean) => void;
    syncStatus: string;
    clearSyncQueue: () => void;
    time: Date;
    user: { email?: string; id?: string; name?: string } | null;
    onTabChange: (tab: string) => void;
    logout: () => void;
    missionCount?: number;
    projectCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
    isPWA,
    isIOS,
    safeAreaTopClass,
    isHeaderVisible,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    zenMode,
    toggleZenMode,
    setIsMissionModalOpen,
    setIsSummaryModalOpen,
    setIsTaskModalOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsThemeModalOpen,
    syncStatus,
    clearSyncQueue,
    time,
    user,
    onTabChange,
    logout,
    missionCount = 0,
    projectCount = 0,
}) => {
    return (
        <>
            <header className={cn(
                "bg-slate-950 border-b border-white/5 flex items-center justify-between px-6 md:px-8 absolute top-0 w-full z-50 overflow-hidden transition-all duration-500",
                isPWA && isIOS ? "h-20 pt-8" : "h-18", // Comfortable height (72px)
                safeAreaTopClass,
                !isHeaderVisible && "-translate-y-full"
            )}>
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

                {/* Top Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                <div className="lg:hidden z-20">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => {
                            if (window.innerWidth >= 768 && window.innerWidth < 1024) {
                                // Tablet: toggle sidebar
                                setIsSidebarOpen(!isSidebarOpen);
                            } else {
                                // Mobile: toggle mobile menu
                                setIsMobileMenuOpen(!isMobileMenuOpen);
                            }
                        }}
                        className="p-3 rounded-xl hover:bg-white/5 transition-colors touch-manipulation"
                        aria-label={
                            (window.innerWidth >= 768 && window.innerWidth < 1024 && isSidebarOpen)
                                ? "Fechar Menu"
                                : isMobileMenuOpen
                                    ? "Fechar Menu"
                                    : "Abrir Menu"
                        }
                        aria-expanded={isMobileMenuOpen || isSidebarOpen}
                    >
                        {((window.innerWidth >= 768 && window.innerWidth < 1024 && isSidebarOpen) || isMobileMenuOpen)
                            ? <X className="w-6 h-6 text-slate-300" />
                            : <Menu className="w-6 h-6 text-slate-300" />}
                    </button>
                </div>

                <div className="flex-1 flex items-center gap-3 z-20">
                    {/* ZEN MODE Button - Hidden on mobile */}
                    <button
                        onClick={toggleZenMode}
                        title={zenMode ? "Desativar Modo Zen" : "Ativar Modo Zen"}
                        className={cn(
                            "hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border transition-all focu-visible:ring-2 focus-visible:ring-blue-500 outline-none",
                            zenMode
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800/50 text-slate-300 border-white/10 hover:bg-slate-700/50 hover:border-white/20"
                        )}
                        aria-label={zenMode ? "Desativar Modo Zen" : "Ativar Modo Zen"}
                        aria-pressed={zenMode}
                    >
                        {zenMode ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                    {/* ... (rest of buttons) */}
                    {/* Just adding aria-hidden to icons in buttons below is enough for now as they have aria-labels */}

                    {/* METAS */}
                    <button
                        onClick={() => onTabChange('goals')}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all font-bold text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                        aria-label="Ver Metas"
                    >
                        <Target className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden lg:inline">METAS</span>
                    </button>

                    {/* NOVO TEMA */}
                    <button
                        onClick={() => setIsThemeModalOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-purple-300 transition-all font-bold text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-purple-500 outline-none"
                        aria-label="Criar Novo Tema"
                    >
                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden lg:inline">NOVO TEMA</span>
                    </button>

                    {/* Missões de Hoje */}
                    <button
                        onClick={() => setIsMissionModalOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white transition-all font-bold text-xs uppercase tracking-wider relative group focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                        aria-label={`Ver Missões de Hoje${missionCount > 0 ? `, ${missionCount} pendentes` : ''}`}
                    >
                        {missionCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-slate-950 animate-in zoom-in slide-in-from-bottom-1 duration-300" aria-hidden="true">
                                {missionCount}
                            </div>
                        )}
                        <CheckSquare className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Missões de Hoje</span>
                    </button>

                    {/* Projetos */}
                    <button
                        onClick={() => setIsSummaryModalOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-slate-800/50 hover:bg-orange-500/20 hover:border-orange-500/30 text-slate-300 hover:text-orange-400 transition-all font-bold text-xs uppercase tracking-wider relative group focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
                        aria-label={`Ver Projetos${projectCount > 0 ? `, ${projectCount} ativos` : ''}`}
                    >
                        {projectCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] border border-slate-950 animate-in zoom-in slide-in-from-bottom-1 duration-300" aria-hidden="true">
                                {projectCount}
                            </div>
                        )}
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Projetos</span>
                    </button>

                    {/* NOVA TAREFA */}
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all font-bold text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                        aria-label="Criar Nova Tarefa"
                    >
                        <CheckSquare className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden lg:inline">NOVA TAREFA</span>
                    </button>

                    {/* Status HUD - Right aligned */}
                    <div className="ml-auto flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 shadow-inner">
                        <div
                            onClick={() => {
                                if (syncStatus === 'error') {
                                    if (confirm("Ocorreu um erro na sincronização. Limpar fila de tarefas pendentes?\n\nIsso pode resolver o ícone vermelho, mas verifique se seus últimos dados foram salvos.")) {
                                        clearSyncQueue();
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (syncStatus === 'error' && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    if (confirm("Ocorreu um erro na sincronização. Limpar fila de tarefas pendentes?")) {
                                        clearSyncQueue();
                                    }
                                }
                            }}
                            tabIndex={syncStatus === 'error' ? 0 : undefined}
                            role={syncStatus === 'error' ? "button" : "status"}
                            aria-label={`Status de sincronização: ${syncStatus === 'synced' ? 'Online e sincronizado' : syncStatus === 'syncing' ? 'Sincronizando' : syncStatus === 'offline' ? 'Offline' : 'Erro de sincronização'}`}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2 bg-white/5 rounded-xl border border-white/5 transition-all select-none group/sync relative touch-manipulation outline-none focus-visible:ring-2",
                                syncStatus === 'error' ? "cursor-pointer hover:bg-red-500/20 border-red-500/50 hover:scale-105 active:scale-95 focus-visible:ring-red-500" : "hover:bg-white/10 focus-visible:ring-white/20"
                            )}
                        >
                            <div className="relative">
                                {syncStatus === 'synced' && <Cloud className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />}
                                {syncStatus === 'syncing' && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" aria-hidden="true" />}
                                {syncStatus === 'offline' && <CloudOff className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />}
                                {syncStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" aria-hidden="true" />}

                                <div className={cn(
                                    "absolute -top-1 -right-1 w-2 h-2 rounded-full border border-slate-900",
                                    syncStatus === 'synced' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                                        syncStatus === 'syncing' ? "bg-blue-500 animate-pulse" :
                                            syncStatus === 'offline' ? "bg-amber-500" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                                )} aria-hidden="true" />
                            </div>

                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest hidden sm:inline",
                                syncStatus === 'synced' ? "text-emerald-400/80" :
                                    syncStatus === 'syncing' ? "text-blue-400/80" :
                                        syncStatus === 'offline' ? "text-amber-400/80" : "text-red-400"
                            )}>
                                {syncStatus === 'synced' ? 'Online' :
                                    syncStatus === 'syncing' ? 'Salvando' :
                                        syncStatus === 'offline' ? 'Offline' : 'Erro'}
                            </span>

                            {/* Info Tooltip */}
                            <div className="absolute top-full right-0 mt-3 p-3 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover/sync:opacity-100 transition-opacity pointer-events-none w-48 z-50 backdrop-blur-xl" aria-hidden="true">
                                <p className="text-[10px] text-white font-bold mb-1">
                                    {syncStatus === 'synced' ? 'Nuvem Atualizada' :
                                        syncStatus === 'syncing' ? 'Sincronizando...' :
                                            syncStatus === 'offline' ? 'Dados Locais' : 'Falha na Sincronização'}
                                </p>
                                <p className="text-[9px] text-slate-400 leading-tight">
                                    {syncStatus === 'synced' ? 'Todos os seus dados estão seguros na nuvem.' :
                                        syncStatus === 'syncing' ? 'Enviando suas alterações para o banco de dados.' :
                                            syncStatus === 'offline' ? 'As alterações serão enviadas quando você voltar a ficar online.' : 'Clique para tentar resolver os conflitos pendentes.'}
                                </p>
                            </div>
                        </div>

                        {/* Clock */}
                        <div className="flex shrink-0 items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-200 font-mono tracking-widest">
                                {format(time, "HH:mm")}
                            </span>
                            <span className="hidden md:inline text-[10px] font-bold text-slate-500 border-l border-white/10 pl-2 whitespace-nowrap">
                                {format(time, "dd/MM")}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay - Keeps access to profile/logout if needed */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden overflow-y-auto bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none fixed" />

                    <div className="relative z-10 px-6 pt-4 pb-6 min-h-screen flex flex-col">
                        {/* Header: Brand & Close */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-white font-black text-xl">⚡</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-slate-100 text-lg leading-none">
                                        Revisão <span className="text-blue-400">PRO</span>
                                    </h1>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* User Profile & XP (Visible on Mobile) */}
                        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center ring-2 ring-white/10 shadow-inner">
                                    <span className="text-white font-bold text-lg">{user?.name?.[0].toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-white">{user?.name}</span>
                                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                {/* LevelBar Removed */}
                            </div>
                        </div>

                        {/* Mobile Menu Options - Expanded to include header actions */}
                        <div className="space-y-2 mt-4 grid gap-2">
                            {/* Mobile Only: ZEN MODE */}
                            <button
                                onClick={() => { toggleZenMode(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                            >
                                {zenMode ? <EyeOff className="w-5 h-5 text-emerald-400" /> : <Eye className="w-5 h-5 text-emerald-400" />}
                                <span>{zenMode ? "Desativar Modo Zen" : "Ativar Modo Zen"}</span>
                            </button>

                            {/* Mobile Only: Nova Tarefa */}
                            <button
                                onClick={() => { setIsTaskModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                            >
                                <CheckSquare className="w-5 h-5 text-blue-400" />
                                <span>Criar Nova Tarefa</span>
                            </button>

                            {/* Mobile Only: Novo Tema */}
                            <button
                                onClick={() => { setIsThemeModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                            >
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                <span>Criar Novo Tema</span>
                            </button>

                            {/* Mobile Only: Projetos/Resumo */}
                            {/* Mobile Only: Resumos (Matches Desktop Sidebar) */}
                            <button
                                onClick={() => { onTabChange('summaries'); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium relative"
                            >
                                <FileText className="w-5 h-5 text-orange-400" />
                                <span>Resumos</span>
                            </button>

                            {/* Mobile Only: Projetos (Restored) */}
                            <button
                                onClick={() => { setIsSummaryModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium relative"
                            >
                                <Clock className="w-5 h-5 text-emerald-400" />
                                <span>Projetos</span>
                                {projectCount > 0 && (
                                    <span className="ml-auto bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {projectCount}
                                    </span>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="h-px bg-white/10 my-2" />

                            <button
                                onClick={() => {
                                    onTabChange('settings');
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-4 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                            >
                                <Settings className="w-5 h-5 text-slate-400" />
                                <span>Configurações</span>
                            </button>
                        </div>

                        {/* Footer: Logout */}
                        <div className="pt-6 border-t border-slate-800 mt-auto">
                            <button onClick={logout} className="flex items-center justify-center gap-2 w-full px-4 py-4 text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all font-medium">
                                <LogOut className="w-5 h-5" />
                                <span>Encerrar Sessão</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
