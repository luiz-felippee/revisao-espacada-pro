import React from 'react';
import { Menu, X } from 'lucide-react';
import { format } from 'date-fns';

interface MobileHeaderProps {
    time: Date;
    onOpenSidebar: () => void;
    onCloseSidebar: () => void;
    isSidebarOpen: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ time, onOpenSidebar, onCloseSidebar, isSidebarOpen }) => {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-4 h-14" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {/* Left: Hamburger Menu or Close Button */}
                <button
                    onClick={isSidebarOpen ? onCloseSidebar : onOpenSidebar}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation"
                    aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
                >
                    {isSidebarOpen ? (
                        <X className="w-6 h-6 text-slate-300" />
                    ) : (
                        <Menu className="w-6 h-6 text-slate-300" />
                    )}
                </button>

                {/* Center: Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-lg">⚡</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xs font-bold text-white">Revisão</span>
                        <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wide">Espaçada</span>
                    </div>
                </div>

                {/* Right: Time & Debug Info (Capsule Style) */}
                <div className="flex items-center gap-2">
                    {/* Online indicator Capsule */}
                    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1.5 shadow-sm">
                        <div className="relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse absolute -top-0.5 -right-0.5 z-10" />
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                                <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3" />
                                <path d="M3.5 16c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">Online</span>
                    </div>

                    {/* Time & Date Capsule */}
                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1.5 shadow-sm text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>

                        <span className="text-sm font-bold tabular-nums leading-none tracking-wide text-white">
                            {format(time, 'HH:mm')}
                        </span>

                        <div className="w-px h-3 bg-slate-700 mx-0.5" />

                        <span className="text-[10px] text-slate-500 font-bold leading-none">
                            {format(time, 'dd/MM')}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
