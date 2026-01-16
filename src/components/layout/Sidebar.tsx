import React from 'react';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    CheckSquare,
    Target,
    BookOpen,
    LogOut,
    BarChart2,
    Settings,
    FileText,
    Briefcase,
    X,
} from 'lucide-react';
import { cn } from '../../lib/utils'; // Adjust path based on location

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    zenMode: boolean;
    user: { email?: string; id?: string; name?: string } | null;
    logout: () => void;
    showSidebar: boolean;
    isSidebarOpen: boolean;
    onCloseSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    zenMode,
    user,
    logout,
    showSidebar,
    isSidebarOpen,
    onCloseSidebar,
}) => {
    // Sidebar collapsa quando não está no dashboard
    const isCollapsed = activeTab !== 'dashboard';

    const menuItems = [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
        { id: 'summaries', label: 'Resumos', icon: FileText },
        { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
        { id: 'goals', label: 'Metas', icon: Target },
        { id: 'projects', label: 'Projetos', icon: Briefcase },
        { id: 'themes', label: 'Temas', icon: BookOpen },
        { id: 'analytics', label: 'Estatísticas', icon: BarChart2 },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <>
            {/* Backdrop for tablet (md-lg) only */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onCloseSidebar}
                    aria-label="Fechar menu"
                />
            )}

            <aside
                aria-label="Menu Lateral"
                className={cn(
                    "flex flex-col bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 overflow-hidden transition-all duration-300",
                    // Largura dinâmica: compacto quando colapsado, largo quando expandido
                    isCollapsed ? "w-20" : "w-72",
                    // Mobile (<md): fixed overlay when open, hidden when closed
                    isSidebarOpen ? "flex fixed inset-y-0 left-0 z-50" : "hidden",
                    // Desktop (lg+): always visible, relative (overrides mobile logic)
                    "lg:!flex lg:relative lg:z-20",
                    zenMode && "opacity-30 hover:opacity-100 grayscale"
                )}
                style={{
                    display: !showSidebar ? 'none !important' : undefined
                }}
            >
                {/* Noise & Gradient */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
                {!zenMode && <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />}


                {/* App Brand */}
                <div className={cn("py-6 relative", isCollapsed ? "px-4" : "px-6")}>
                    {isCollapsed ? (
                        <div className="flex justify-center">
                            <div
                                onClick={() => onTabChange('dashboard')}
                                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform"
                            >
                                <span className="text-white font-black text-xl">⚡</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                onClick={() => onTabChange('dashboard')}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <span className="text-white font-black text-2xl">⚡</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-white leading-none text-lg">
                                        Revisão
                                    </h1>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                        ESPAÇADA PRO
                                    </span>
                                </div>
                            </div>

                            {/* Botão de fechar - só quando expandido */}
                            <button
                                onClick={() => onTabChange('calendar')}
                                className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                aria-label="Colapsar menu"
                                title="Colapsar menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* User Profile Card */}
                {!zenMode && (
                    <div className={cn("mb-6", isCollapsed ? "px-2" : "px-4")}>
                        {isCollapsed ? (
                            <div className="flex justify-center">
                                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-600/50">
                                    <span className="text-white font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-600/50">
                                            <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-white block leading-tight">{user?.name || 'Usuário'}</span>
                                            <span className="text-[11px] text-emerald-400 font-medium">Online</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                                        title="Sair"
                                        aria-label="Sair"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className={cn(
                    "flex-1 space-y-1 overflow-y-scroll custom-scrollbar overscroll-none",
                    isCollapsed ? "px-2" : "px-4"
                )}>
                    {!isCollapsed && (
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu Principal</p>
                    )}
                    {menuItems.map((item) => (
                        <div key={item.id} className="relative">
                            <button
                                onClick={() => {
                                    onTabChange(item.id);
                                    // Fechar menu automaticamente no mobile ao navegar
                                    if (window.innerWidth < 1024) {
                                        onCloseSidebar();
                                    }
                                }}
                                className={cn(
                                    "relative group flex items-center w-full rounded-xl transition-all duration-300 overflow-visible",
                                    isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                                    activeTab === item.id
                                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/30"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                )}
                                role="tab"
                                aria-selected={activeTab === item.id}
                                aria-label={item.label}
                            >
                                {/* Indicador de seleção - visível sempre quando ativo */}
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                                )}
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors relative z-10",
                                    activeTab === item.id ? "text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" : "text-slate-500 group-hover:text-slate-300"
                                )} />
                                {!isCollapsed && (
                                    <span className="relative z-10 font-medium tracking-wide">{item.label}</span>
                                )}

                                {/* Tooltip - aparece ao passar o mouse */}
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none">
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                                </div>
                            </button>
                        </div>
                    ))}
                </nav>
            </aside >
        </>
    );
};
