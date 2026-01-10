import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoroContext } from '../../context/PomodoroContext';
import { useStudy } from '../../context/StudyContext';
import { useAudio } from '../../context/useAudio';
import { Play, Pause, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GlobalActionBar = () => {
    const {
        activeFocus,
        endFocus,
        tasks,
        goals
    } = useStudy();

    const {
        timeLeft,
        isActive,
        mode,
        toggleTimer,
        openWidget,
        isWidgetVisible,
        resetTimer,
        linkedItemId,
        settings
    } = usePomodoroContext();

    const { stopAudio } = useAudio();

    const prevIsActive = useRef(isActive);

    // Auto-start audio when focus begins, auto-stop when focus ends
    useEffect(() => {
        // Detect when focus session ends
        if (!isActive && prevIsActive.current) {
            stopAudio();
        }
        prevIsActive.current = isActive;
    }, [isActive, stopAudio]);

    // Robust Active Title Logic
    // If activeFocus (Session) is missing, try to resolve from linkedItemId (Pomodoro persistence)
    const activeTitle = React.useMemo(() => {
        if (activeFocus?.title) return activeFocus.title;

        if (linkedItemId) {
            // Try finding in Tasks
            const task = tasks.find(t => t.id === linkedItemId);
            if (task) return task.title;

            // Try Goals
            const goal = goals.find(g => g.id === linkedItemId);
            if (goal) return goal.title;

            // Try Goal Items
            for (const g of goals) {
                const item = g.checklist?.find(i => i.id === linkedItemId);
                if (item) return item.title;
            }

            // Try Themes/Subthemes
            // (Assuming flat lookup or known structure, simplest is main themes or iterating)
            // For now, let's keep it simple or user might just restart.
        }

        return 'Sem tarefa selecionada';
    }, [activeFocus, linkedItemId, tasks, goals]);

    // Determines if we are in "Validation Mode" (Timer finished + Active Focus)
    const isValidationReady = timeLeft === 0 && mode === 'focus' && (!!activeFocus || !!linkedItemId);



    const handleStop = () => {
        endFocus(false); // Cancel
        resetTimer();
        stopAudio(); // Stop background audio
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getModeDuration = () => {
        if (mode === 'focus') return settings.focusDuration * 60;
        if (mode === 'shortBreak') return settings.shortBreakDuration * 60;
        return settings.longBreakDuration * 60;
    };

    // If nothing is active and no timer is running, we could show a "Daily Status" or just hide.
    // For now, let's only show if there is an Active Focus OR the Timer is Active/Paused (not initial state).
    // Actually, user wants it "always visible" maybe? Let's check requirements.
    // "apareça em todas as telas".
    // If nothing active, maybe show "Pronto para focar?"
    // Let's settle on: Show if Active Focus OR Timer Running OR Validation Ready.
    const shouldShow = !!activeFocus || isActive || isValidationReady || timeLeft !== getModeDuration();

    // Always show when active - don't hide even if big widget is open
    // REVISION: Hide if big widget is already showing to avoid "double validation" buttons
    if (!shouldShow || isWidgetVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
            <AnimatePresence>
                {shouldShow && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-full shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-300 cursor-move",
                            isValidationReady
                                ? "bg-emerald-950/90 border-emerald-500/50 shadow-emerald-900/40"
                                : "bg-slate-900/80 border-slate-700/50 shadow-black/50"
                        )}
                        onClick={() => {
                            if (!isValidationReady) {
                                toggleTimer();
                            }
                        }}
                    >
                        {/* 1. Validation Logic */}
                        {isValidationReady ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-950" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Foco Finalizado</span>
                                    <span className="text-sm font-medium text-white max-w-[200px] truncate">{activeTitle}</span>
                                </div>
                                <div className="h-8 w-px bg-white/10 mx-1" />

                                {activeFocus?.type === 'subtheme' && activeFocus?.reviewType === 'review' ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={openWidget}
                                            className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-full transition-all text-sm shadow-lg shadow-emerald-500/20"
                                        >
                                            Validar Sessão
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={openWidget}
                                        className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-full transition-colors text-sm shadow-lg shadow-emerald-500/20"
                                    >
                                        Validar Sessão
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* 2. Active Focus / Timer Logic - Compact Version */
                            <>
                                {/* Timer Circle - Smaller */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center relative select-none shrink-0",
                                    mode === 'focus' ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="16" cy="16" r="14" className="fill-none stroke-white/5" strokeWidth="2" />
                                        <motion.circle
                                            cx="16" cy="16" r="14"
                                            className="fill-none stroke-current"
                                            strokeWidth="2"
                                            initial={{ pathLength: 1 }}
                                            animate={{ pathLength: timeLeft / getModeDuration() }}
                                        />
                                    </svg>
                                    <span className="text-[9px] font-mono font-bold z-10">{formatTime(timeLeft)}</span>
                                </div>

                                {/* Activity Name - More Prominent */}
                                <span className="text-sm font-medium text-white max-w-[180px] truncate select-none">
                                    {activeTitle}
                                </span>

                                {/* Controls - Compact */}
                                <div className="flex items-center gap-0.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleTimer(); }}
                                        className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
                                        title={isActive ? "Pausar" : "Retomar"}
                                    >
                                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    </button>

                                    {/* Cancel Focus button - always visible */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleStop(); }}
                                        className="p-1.5 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
                                        title="Cancelar Foco"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
