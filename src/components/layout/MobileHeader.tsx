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
            {/* Primeira linha: Menu + Status compacto */}
            <div className="flex items-center justify-between px-4 h-12" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {/* Left: Hamburger Menu */}
                <button
                    onClick={isSidebarOpen ? onCloseSidebar : onOpenSidebar}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation"
                    aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
                >
                    {isSidebarOpen ? (
                        <X className="w-5 h-5 text-slate-300" />
                    ) : (
                        <Menu className="w-5 h-5 text-slate-300" />
                    )}
                </button>

                {/* Right: Status Online + Data/Hora UNIDOS e COMPACTOS */}
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-2.5 py-1 shadow-sm">
                    {/* Online indicator */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse absolute -top-0.5 -right-0.5 z-10" />
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                            <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3" />
                            <path d="M3.5 16c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                        </svg>
                    </div>
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider leading-none">ON</span>

                    <div className="w-px h-2.5 bg-slate-700" />

                    {/* Clock icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>

                    {/* Time */}
                    <span className="text-[11px] font-bold tabular-nums leading-none tracking-tight text-white">
                        {format(time, 'HH:mm')}
                    </span>

                    <div className="w-px h-2.5 bg-slate-700" />

                    {/* Date */}
                    <span className="text-[9px] text-slate-400 font-semibold leading-none tracking-tight">
                        {format(time, 'dd/MM')}
                    </span>
                </div>
            </div>

            {/* Segunda linha: Logo centralizado */}
            <div className="flex items-center justify-center pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-base">⚡</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xs font-bold text-white">Revisão</span>
                        <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wide">Espaçada</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
