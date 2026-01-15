import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Target, List, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileThemesModal } from '../../features/themes/components/MobileThemesModal';

interface MobileBottomNavProps {
    // kept for compatibility if needed, but ignored
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onOpenMission?: () => void;
    missionCount?: number;
    hasOverdueTasks?: boolean;
}

export const MobileBottomNav = ({ onOpenMission, missionCount = 0, hasOverdueTasks = false }: MobileBottomNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab from path
    const path = location.pathname.substring(1); // remove '/'
    const activeTab = path || 'dashboard';

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
        { id: 'themes', icon: BookOpen, label: 'Temas' },
        { id: 'projects', icon: Briefcase, label: 'Projetos' },
        { id: 'mission-trigger', icon: Target, label: 'Missão', special: true },
        { id: 'tasks', icon: List, label: 'Tarefas' },
        { id: 'goals', icon: Target, label: 'Metas' },
    ];

    const [activeFeedback, setActiveFeedback] = React.useState<string | null>(null);
    const feedbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const [isThemesModalOpen, setIsThemesModalOpen] = React.useState(false);

    const showFeedback = (label: string) => {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        setActiveFeedback(label);
        feedbackTimeoutRef.current = setTimeout(() => {
            setActiveFeedback(null);
        }, 3000);
    };

    const leftItems = menuItems.filter(i => !i.special && ['dashboard', 'themes', 'projects'].includes(i.id));
    const rightItems = menuItems.filter(i => !i.special && ['tasks', 'goals'].includes(i.id));
    const specialItem = menuItems.find(i => i.special);

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    {activeFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none"
                        >
                            <span className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md whitespace-nowrap">
                                {activeFeedback}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 z-50 lg:hidden flex items-center justify-between px-2 xs:px-4 pb-[env(safe-area-inset-bottom,12px)]">
                {/* Grupo Esquerda (Painel, Agenda, Resumos) - flex-1 garante centralização do botão do meio na tela */}
                <div className="flex-1 flex items-center justify-around">
                    {leftItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    showFeedback(item.label);
                                    // Se for themes no mobile, abre modal ao invés de navegar
                                    if (item.id === 'themes') {
                                        setIsThemesModalOpen(true);
                                    } else {
                                        navigate(`/${item.id}`);
                                    }
                                }}
                                className={cn(
                                    "relative group flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-16 transition-all active:scale-90 touch-manipulation",
                                    isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {/* Tooltip acima */}
                                <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                                    {item.label}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute top-0 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        style={{ top: -8 }}
                                    />
                                )}
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-blue-500/10" : "group-hover:bg-white/5"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 xs:w-6 xs:h-6 transition-all duration-300",
                                        isActive && "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[7px] xs:text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 line-clamp-1 max-w-full px-0.5",
                                    isActive && "text-blue-400 text-[8px] xs:text-[10px]"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Espaçador Central para alinhar o Botão Flutuante */}
                <div className="w-16 xs:w-20 relative flex-shrink-0">
                    {specialItem && (
                        <button
                            onClick={() => {
                                showFeedback('Nova Missão');
                                onOpenMission?.();
                            }}
                            className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center justify-center active:scale-95 transition-all group touch-manipulation"
                            style={{ zIndex: 10 }}
                        >
                            {/* Tooltip acima */}
                            <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                                Missão de Hoje
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                            </div>

                            <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-[0_4px_25px_rgba(59,130,246,0.6)] border-4 border-slate-950 ring-2 ring-blue-400/20 group-hover:scale-110 transition-transform duration-300 relative">
                                <specialItem.icon className="w-6 h-6 xs:w-7 xs:h-7 text-white drop-shadow-md" />
                                {missionCount > 0 && (
                                    <div className={cn(
                                        "absolute -top-1 -right-1 text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg border-2 border-slate-950",
                                        hasOverdueTasks
                                            ? "bg-orange-500 animate-pulse shadow-orange-500/50"
                                            : "bg-red-500"
                                    )}>
                                        {missionCount}
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-full bg-blue-400/10 animate-pulse -z-10" />
                            </div>
                            <span className="text-[9px] xs:text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 drop-shadow-lg">
                                Missão
                            </span>
                        </button>
                    )}
                </div>

                {/* Grupo Direita (Tarefas, Metas) - flex-1 deve ter o mesmo peso do grupo da esquerda para centralização perfeita */}
                <div className="flex-1 flex items-center justify-around">
                    {rightItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    showFeedback(item.label);
                                    navigate(`/${item.id}`);
                                }}
                                className={cn(
                                    "relative group flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-16 transition-all active:scale-90 touch-manipulation",
                                    isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {/* Tooltip acima */}
                                <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                                    {item.label}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute top-0 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        style={{ top: -8 }}
                                    />
                                )}
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-blue-500/10" : "group-hover:bg-white/5"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 xs:w-6 xs:h-6 transition-all duration-300",
                                        isActive && "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[7px] xs:text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 line-clamp-1 max-w-full px-0.5",
                                    isActive && "text-blue-400 text-[8px] xs:text-[10px]"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Themes Modal */}
            <MobileThemesModal
                isOpen={isThemesModalOpen}
                onClose={() => setIsThemesModalOpen(false)}
            />
        </>
    );
};
