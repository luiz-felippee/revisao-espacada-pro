import React from 'react';
import { Menu } from 'lucide-react';
import { format } from 'date-fns';

interface MobileHeaderProps {
    time: Date;
    onOpenSidebar: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ time, onOpenSidebar }) => {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-4 h-14" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {/* Left: Hamburger Menu */}
                <button
                    onClick={onOpenSidebar}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation"
                    aria-label="Abrir menu"
                >
                    <Menu className="w-6 h-6 text-slate-300" />
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

                {/* Right: Time & Debug */}
                <div className="flex flex-col items-end leading-none">
                    <span className="text-xs font-bold text-white tabular-nums">
                        {format(time, 'HH:mm')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                        {format(time, 'dd/MM')}
                    </span>
                </div>
            </div>
        </header>
    );
};
