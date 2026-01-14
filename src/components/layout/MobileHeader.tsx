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

                {/* Right: Time & Debug Info */}
                <div className="flex items-center gap-3">
                    {/* Online indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wide">Online</span>
                    </div>

                    {/* Time & Date */}
                    <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-sm font-bold tabular-nums">
                            {format(time, 'HH:mm')}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            {format(time, 'dd/MM')}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
