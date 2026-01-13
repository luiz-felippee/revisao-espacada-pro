import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Calendar as CalendarIcon, Target, List, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileBottomNavProps {
    // kept for compatibility if needed, but ignored
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onOpenMission?: () => void;
    missionCount?: number;
}

export const MobileBottomNav = ({ onOpenMission, missionCount = 0 }: MobileBottomNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab from path
    const path = location.pathname.substring(1); // remove '/'
    const activeTab = path || 'dashboard';

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
        { id: 'calendar', icon: CalendarIcon, label: 'Agenda' },
        { id: 'summaries', icon: FileText, label: 'Resumos' }, // Added
        { id: 'mission-trigger', icon: Target, label: 'Missão', special: true }, // Added center item
        { id: 'tasks', icon: List, label: 'Tarefas' }, // Changed Icon to List to differentiate
        { id: 'goals', icon: Target, label: 'Metas' },
    ];

    const [activeFeedback, setActiveFeedback] = React.useState<string | null>(null);
    const feedbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const showFeedback = (label: string) => {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        setActiveFeedback(label);
        feedbackTimeoutRef.current = setTimeout(() => {
            setActiveFeedback(null);
        }, 3000);
    };

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

            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 z-50 lg:hidden grid grid-cols-6 gap-4 items-center px-5 pb-[env(safe-area-inset-bottom,12px)]">
                {menuItems.map((item) => {
                    if (item.special) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    showFeedback('Nova Missão');
                                    onOpenMission?.();
                                }}
                                className="absolute left-1/2 -translate-x-1/2 bottom-4 flex flex-col items-center justify-center active:scale-95 transition-all group touch-manipulation"
                                aria-label="Abrir Missão"
                                style={{ zIndex: 10 }}
                            >
                                <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.6)] border-4 border-slate-950 ring-2 ring-white/20 group-hover:scale-110 transition-transform duration-300 relative">
                                    <item.icon className="w-6 h-6 xs:w-7 xs:h-7 text-white drop-shadow-md" />
                                    {missionCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full shadow-lg border border-slate-950">
                                            {missionCount}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] xs:text-[10px] font-bold text-blue-400 uppercase tracking-tighter mt-1 hidden xs:block">Missão</span>
                            </button>
                        );
                    }

                    const isActive = activeTab === item.id;

                    // Get index of current item (excluding special button)
                    const normalItems = menuItems.filter(m => !m.special);
                    const itemIndex = normalItems.findIndex(m => m.id === item.id);

                    // Add margin to buttons adjacent to center button (index 2 and 3 in normal items = before and after center)
                    const isBeforeCenter = itemIndex === 2; // summaries
                    const isAfterCenter = itemIndex === 3; // tasks

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                showFeedback(item.label);
                                navigate(`/${item.id}`);
                            }}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-0.5 xs:gap-1 flex-1 max-w-[3.5rem] h-12 transition-all active:scale-90 touch-manipulation",
                                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300",
                                isBeforeCenter && "mr-6 xs:mr-8",
                                isAfterCenter && "ml-6 xs:ml-8"
                            )}
                            aria-label={item.label}
                            role="tab"
                            aria-selected={isActive}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-bg"
                                    className="absolute top-0 w-6 h-1 bg-blue-500 rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{ top: -12 }}
                                />
                            )}

                            <div className={cn(
                                "p-2.5 rounded-xl transition-all duration-300",
                                isActive ? "bg-blue-500/10" : ""
                            )}>
                                <item.icon className={cn(
                                    "w-5 h-5 xs:w-6 xs:h-6 transition-all duration-300",
                                    isActive && "scale-110"
                                )} />
                            </div>

                            <span className={cn(
                                "text-[9px] xs:text-[10px] font-bold uppercase tracking-tighter transition-all duration-300 line-clamp-1 max-w-full",
                                isActive && "text-blue-400"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
};
