import { useRef, useEffect, useState } from 'react';
import { logger } from '../../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoroContext } from '../../context/PomodoroContext';
import { useStudy } from '../../context/StudyContext';
import { useAudio } from '../../context/AudioContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { Play, Pause, SkipForward, RefreshCw, Timer, X, Volume2, CloudRain, Zap, Waves, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PomodoroWidget = () => {
    const {
        mode,
        timeLeft,
        isActive,
        cycles,
        linkedItemId,
        toggleTimer,
        resetTimer,
        skipTimer,
        isWidgetVisible,
        closeWidget,
        openWidget,
        settings
    } = usePomodoroContext();

    const { endFocus, activeFocus, completeReview, toggleTask, toggleGoal, toggleGoalItem } = useStudy();
    const { isPlaying: isAudioPlaying, togglePlay: toggleAudio, volume, setVolume, currentSound, setSound } = useAudio();
    const { confirm: confirmAction } = useConfirm();
    const { showToast } = useToast();

    // NEW: Wrapper to enforce active focus
    const handleToggleTimer = () => {
        // Always allow pausing or interacting if already active
        if (isActive) {
            toggleTimer();
            return;
        }

        // Prevent STARTING focus if no active task
        if (mode === 'focus' && !activeFocus) {
            showToast("⚠️ Inicie uma atividade para começar o foco!", "warning");
            return;
        }

        toggleTimer();
    };

    const handleClose = async () => {
        if (linkedItemId || activeFocus) {
            const confirmed = await confirmAction({ message: 'Deseja cancelar o foco atual?', isDangerous: true });
            if (!confirmed) {
                return;
            }
            endFocus(false);
            resetTimer();
        }
        closeWidget();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'focus': return 'Foco';
            case 'shortBreak': return 'Pausa Curta';
            case 'longBreak': return 'Pausa Longa';
        }
    };

    const getModeColor = () => {
        switch (mode) {
            case 'focus': return 'from-rose-500 to-red-600 border-rose-500/20 shadow-rose-900/20';
            case 'shortBreak': return 'from-emerald-500 to-green-600 border-emerald-500/20 shadow-emerald-900/20';
            case 'longBreak': return 'from-blue-500 to-indigo-600 border-blue-500/20 shadow-blue-900/20';
        }
    };

    // State for minimizing
    const [isMinimized, setIsMinimized] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('pomodoro-position');
        return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    });
    const [showValidate, setShowValidate] = useState(false);
    const [validationStep, setValidationStep] = useState<'validate' | 'summary'>('validate');
    const [showSoundPanel, setShowSoundPanel] = useState(false);

    // Splash screen state
    const [showSplash, setShowSplash] = useState(false);
    const [hasShownSplash, setHasShownSplash] = useState(false);
    const [summaryText, setSummaryText] = useState('');

    const getModeDuration = () => {
        if (mode === 'focus') return settings.focusDuration * 60;
        if (mode === 'shortBreak') return settings.shortBreakDuration * 60;
        return settings.longBreakDuration * 60;
    };
    const circleProgress = (timeLeft / getModeDuration()) * 100;

    // Effect: Detect Focus End for Validation
    useEffect(() => {
        // Only show validate if we have an active focus AND timer is finished AND we were in focus mode
        if (timeLeft === 0 && mode === 'focus' && activeFocus) {
            setShowValidate(true);
            setValidationStep('validate'); // Start at validation step
            setIsMinimized(false); // Force open
        } else if (timeLeft !== 0) {
            // Clear validation state if timer is not 0 (e.g. reset)
            setShowValidate(false);
            setSummaryText('');
        }
    }, [timeLeft, mode, activeFocus]);

    const handleConfirmValidation = () => {
        setValidationStep('summary');
    };

    // Use ref to track session start time (doesn't trigger re-renders)
    const sessionStartTimeRef = useRef<number | null>(null);
    const [showHeadline, setShowHeadline] = useState(false);

    // Reset session start time when mode/linkedItem changes
    useEffect(() => {
        sessionStartTimeRef.current = null;
        setShowHeadline(false);
    }, [mode, linkedItemId]);

    // Track headline visibility based on elapsed time
    useEffect(() => {
        if (!isActive || mode !== 'focus' || !activeFocus) {
            setShowHeadline(false);
            sessionStartTimeRef.current = null;
            return;
        }

        // Initialize start time on first active focus
        if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = Date.now();
            setShowHeadline(true);
        }

        // Check every second if we should hide the headline
        const checkInterval = setInterval(() => {
            if (sessionStartTimeRef.current) {
                const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
                if (elapsed >= 20) {
                    setShowHeadline(false);
                    clearInterval(checkInterval);
                }
            }
        }, 1000);

        return () => clearInterval(checkInterval);
    }, [isActive, mode, activeFocus]);

    const showActivityHeadline = showHeadline && mode === 'focus' && isActive && activeFocus;

    const handleFinalizeSession = async () => {
        if (!activeFocus) return;

        try {
            // Identify if something was written (passed to completion functions)
            if (activeFocus.type === 'subtheme') {
                if (activeFocus.reviewNumber !== undefined) {
                    await completeReview(activeFocus.id, activeFocus.reviewNumber, activeFocus.reviewType || 'review', 'medium', summaryText);
                }
            } else if (activeFocus.type === 'task') {
                toggleTask(activeFocus.id, undefined, summaryText);
            } else if (activeFocus.type === 'goal') {
                if (activeFocus.parentId) {
                    toggleGoalItem(activeFocus.parentId, activeFocus.id, undefined, summaryText);
                } else {
                    toggleGoal(activeFocus.id, undefined, summaryText);
                }
            }

            // Cleanup: No new pomodoro should appear
            setShowValidate(false);
            endFocus(true, summaryText); // StudyContext cleanup
            resetTimer();   // Reset time to default
            closeWidget();  // Close widget entirely

            // Reset local states
            setSummaryText('');
            setValidationStep('validate');
        } catch (error) {
            console.error("Failed to validate:", error);
        }
    };

    // Splash Screen & Auto-Minimize Logic
    useEffect(() => {
        if (isActive && activeFocus && !hasShownSplash) {
            // Show splash screen with activity name for 3 seconds
            setShowSplash(true);
            setIsMinimized(false); // Show maximized during splash
            openWidget(); // CRITICAL: Open widget so it becomes visible!
            console.log('🎉 [POMODORO WIDGET] Showing splash screen for:', activeFocus.title);

            // After 3 seconds, hide splash and auto-minimize
            const timeout = setTimeout(() => {
                setShowSplash(false);
                setIsMinimized(true); // Auto-minimize to circular widget
                setHasShownSplash(true); // Don't show splash again for this session
                // CRITICAL: Reset position to (0,0) to ensure widget is in viewport!
                setPosition({ x: 0, y: 0 });
                localStorage.setItem('pomodoro-position', JSON.stringify({ x: 0, y: 0 }));
                console.log('✔️ [POMODORO WIDGET] Splash complete, minimized to circular widget at (0,0)');
            }, 3000);

            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, activeFocus, hasShownSplash]); // Removed openWidget to prevent infinite loop

    // Reset splash flag when session ends
    useEffect(() => {
        if (!activeFocus) {
            setHasShownSplash(false);
            console.log('🔄 [POMODORO WIDGET] Session ended, reset splash flag');
        }
    }, [activeFocus]);

    // Triple-click recovery logic
    useEffect(() => {
        let clickCount = 0;
        let lastClickTime = 0;
        const CLICK_THRESHOLD = 300; // ms

        const handleGlobalClick = () => {
            const now = Date.now();
            if (now - lastClickTime < CLICK_THRESHOLD) {
                clickCount++;
            } else {
                clickCount = 1;
            }
            lastClickTime = now;

            if (clickCount >= 2) {
                // Force Reset & Show
                setIsMinimized(true);
                setPosition({ x: 0, y: 0 }); // Reset to default anchor (bottom-right)
                openWidget();
                clickCount = 0;
                logger.info('Pomodoro recovered via double-click');
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // DEBUG: Log widget state changes (only on significant changes)
    useEffect(() => {
        console.log('👁️ [POMODORO WIDGET] State:', {
            isWidgetVisible,
            isActive,
            isMinimized,
            showValidate,
            mode,
            linkedItemId,
            activeFocus: activeFocus?.id,
            position
        });
        // Removed timeLeft from dependencies to prevent logging every second
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWidgetVisible, isActive, mode, linkedItemId, activeFocus?.id, isMinimized, showValidate]);

    // SPLASH SCREEN: Show activity name for 3 seconds
    if (showSplash && activeFocus) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center px-8"
                >
                    <motion.h1
                        className="text-5xl md:text-6xl font-black text-white mb-4 bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {activeFocus.title}
                    </motion.h1>
                    <motion.p
                        className="text-xl md:text-2xl text-slate-300 font-medium"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Preparando foco...
                    </motion.p>
                    <motion.div
                        className="mt-6 flex justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

    if (!isWidgetVisible) {
        console.log('🚫 [POMODORO WIDGET] Widget not visible, showing FAB only');
        return (
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, info) => {
                    setTimeout(() => setIsDragging(false), 100);
                    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
                    setPosition(newPos);
                    localStorage.setItem('pomodoro-position', JSON.stringify(newPos));
                }}
                style={{ x: position.x, y: position.y }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                whileDrag={{ scale: 1.1 }}
                className={cn(
                    "fixed bottom-28 md:bottom-10 right-4 md:right-10 z-[9999]",
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl",
                    "bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white group cursor-grab active:cursor-grabbing",
                    isActive ? "border-rose-500/50 shadow-rose-500/20" : "hover:border-emerald-500/50 shadow-black/50"
                )}
            >
                <div
                    className="absolute inset-0 z-0 rounded-full"
                    onClick={() => {
                        if (!isDragging) {
                            handleToggleTimer();
                        }
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        openWidget();
                    }}
                />

                {/* Progress Ring if Active */}
                {isActive && (
                    <div className="absolute inset-0 animate-spin" style={{ animationPlayState: isActive ? 'running' : 'paused' }}>
                        <svg className="w-full h-full -rotate-90 scale-90 pointer-events-none">
                            <circle cx="32" cy="32" r="28" className="fill-none stroke-white/5" strokeWidth="4" />
                            <motion.circle
                                cx="32" cy="32" r="28"
                                className="fill-none stroke-rose-500"
                                strokeWidth="4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: circleProgress / 100 }}
                                transition={{ duration: 0.5 }}
                            />
                        </svg>
                    </div>
                )}

                <div className="relative z-10 flex items-center justify-center pointer-events-none">
                    {isActive ? (
                        <div className="flex flex-col items-center">
                            <span className="text-[11px] font-mono font-black text-rose-400 leading-none mb-0.5">
                                {formatTime(timeLeft)}
                            </span>
                            <Play className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                        </div>
                    ) : (
                        <Timer className="w-7 h-7 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    )}
                </div>

                {/* Pulsing glow if active */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-pulse -z-10 pointer-events-none" />
                )}

                {/* Hint to open */}
                <div className="absolute -top-1 -right-1 bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Timer className="w-2.5 h-2.5 text-white" />
                </div>

                {/* Close Button on FAB */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="absolute -top-2 -left-2 bg-slate-900 border border-white/10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 hover:border-rose-500/50 text-slate-500 hover:text-rose-500"
                    title="Fechar"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </motion.div>
        );
    }

    // MINIMIZED VIEW (Floating Pill)
    if (isMinimized && !showValidate) {
        console.log('🔴 [POMODORO WIDGET] Rendering MINIMIZED view (circular pill)');
        return (
            <motion.div
                layoutId="pomodoro-widget"
                drag
                dragMomentum={false}
                dragElastic={0}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, info) => {
                    setTimeout(() => setIsDragging(false), 100);
                    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
                    setPosition(newPos);
                    localStorage.setItem('pomodoro-position', JSON.stringify(newPos));
                }}
                style={{ x: position.x, y: position.y }}
                whileDrag={{ scale: 1.1 }}
                className={cn(
                    "fixed bottom-28 md:bottom-10 right-4 md:right-10 z-[9999] p-1 rounded-full shadow-2xl backdrop-blur-xl border cursor-grab active:cursor-grabbing group",
                    "bg-slate-900/95 border-slate-700/50 hover:border-slate-500",
                    mode === 'focus' ? 'shadow-rose-900/30' : mode === 'shortBreak' ? 'shadow-emerald-900/30' : 'shadow-blue-900/30'
                )}
            >
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div
                        className="absolute inset-0 z-20 rounded-full"
                        onClick={() => {
                            if (!isDragging) {
                                handleToggleTimer();
                            }
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(false);
                        }}
                    />

                    <div className="absolute inset-0 animate-spin" style={{ animationPlayState: isActive ? 'running' : 'paused' }}>
                        <svg className="w-full h-full -rotate-90 scale-90 pointer-events-none">
                            <circle cx="32" cy="32" r="28" className="fill-none stroke-slate-800" strokeWidth="4" />
                            <circle
                                cx="32" cy="32" r="28"
                                className={cn(
                                    "fill-none transition-all duration-1000",
                                    mode === 'focus' ? "stroke-rose-500" : mode === 'shortBreak' ? "stroke-emerald-500" : "stroke-blue-500"
                                )}
                                strokeWidth="4"
                                strokeDasharray="176" // 2 * PI * 28
                                strokeDashoffset={176 - (176 * (circleProgress / 100))}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none">
                        <span className={cn(
                            "text-[11px] font-mono font-black border-b border-transparent leading-none",
                            mode === 'focus' ? "text-rose-400" : mode === 'shortBreak' ? "text-emerald-400" : "text-blue-400"
                        )}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className="mt-0.5 opacity-60">
                            {isActive ? (
                                <Pause className={cn("w-2 h-2 fill-current", mode === 'focus' ? "text-rose-500" : "text-emerald-500")} />
                            ) : (
                                <Play className={cn("w-2 h-2 fill-current", mode === 'focus' ? "text-rose-500" : "text-emerald-500")} />
                            )}
                        </div>
                    </div>

                    {/* Quick Expand Hint */}
                    <div className="absolute bottom-1 right-1 bg-blue-500/20 w-3 h-3 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    </div>

                    {/* Close Button on Pill */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        className="absolute -top-1 -left-1 bg-slate-900 border border-white/10 w-5 h-5 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 hover:border-rose-500/50 text-slate-500 hover:text-rose-500"
                        title="Fechar"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </motion.div>
        );
    }

    // MAXIMIZED VIEW (Overlay)
    console.log('🟢 [POMODORO WIDGET] Rendering MAXIMIZED view (full overlay)');
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9990]"
                onClick={() => setIsMinimized(true)}
            />

            <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
                <motion.div
                    layoutId="pomodoro-widget"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={cn(
                        "pointer-events-auto relative flex flex-col items-center",
                        "w-[90vw] max-w-sm md:w-96 rounded-[2.5rem] p-6 md:p-8 shadow-2xl backdrop-blur-2xl border cursor-default overflow-hidden transition-colors duration-500",
                        "bg-slate-900/95 border-slate-800/50",
                        "text-white",
                        getModeColor().replace('from-', 'border-')
                    )}
                    style={{
                        boxShadow: mode === 'focus' ? '0 0 100px -10px rgba(244, 63, 94, 0.4)' :
                            mode === 'shortBreak' ? '0 10px 40px -10px rgba(16, 185, 129, 0.2)' :
                                '0 10px 40px -10px rgba(59, 130, 246, 0.2)'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between w-full mb-8 mt-2">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "p-2 rounded-xl bg-slate-800/50",
                                mode === 'focus' ? 'text-rose-400' :
                                    mode === 'shortBreak' ? 'text-emerald-400' : 'text-blue-400'
                            )}>
                                <Timer className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] select-none text-slate-400">
                                {getModeLabel()}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSoundPanel(!showSoundPanel)}
                                className={cn(
                                    "p-2 transition-all rounded-xl hover:bg-slate-800/50",
                                    isAudioPlaying ? "text-blue-400 bg-blue-500/10" : "text-slate-500 hover:text-white"
                                )}
                                title="Sons de Foco"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-2 text-slate-500 hover:text-white transition-all rounded-xl hover:bg-slate-800/50"
                                title="Minimizar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Check if Sound Panel is open */}
                    {showSoundPanel ? (
                        <div className="w-full h-56 mb-10 overflow-hidden flex flex-col gap-4">
                            {/* ... Sound Panel Content ... */}
                            <div className="flex items-center justify-between px-2">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ambiente</span>
                                <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-slate-500" />
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.05"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="w-24 accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {[
                                    { id: 'white', label: 'Ruído Branco', icon: Zap },
                                    { id: 'pink', label: 'Ruído Rosa', icon: Waves },
                                    { id: 'brown', label: 'Ruído Marrom', icon: Volume2 },
                                    { id: 'rain', label: 'Chuva', icon: CloudRain },
                                ].map((sound) => (
                                    <button
                                        key={sound.id}
                                        onClick={() => {
                                            if (currentSound === sound.id && isAudioPlaying) {
                                                toggleAudio();
                                            } else {
                                                setSound(sound.id as any);
                                                if (!isAudioPlaying) toggleAudio();
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
                                            currentSound === sound.id && isAudioPlaying
                                                ? "bg-blue-500/20 border-blue-500/50 text-white"
                                                : "bg-slate-800/50 border-slate-800/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                        )}
                                    >
                                        <sound.icon className={cn("w-6 h-6 mb-2", currentSound === sound.id && isAudioPlaying && "animate-pulse")} />
                                        <span className="text-xs font-bold">{sound.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : showValidate ? (
                        validationStep === 'validate' ? (
                            /* Step 1: Validation Button Only */
                            <div className="w-full h-auto min-h-[14rem] mb-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Foco Finalizado!</h3>
                                    <p className="text-slate-400">Excelente trabalho. Vamos registrar?</p>
                                </div>

                                <button
                                    onClick={handleConfirmValidation}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                                >
                                    <span>Validar Sessão</span>
                                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            /* Step 2: Summary Input */
                            <div className="w-full h-auto min-h-[14rem] mb-6 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <h3 className="text-xl font-bold text-white mb-1">Resumo da Sessão 📝</h3>
                                    <p className="text-sm text-slate-400">O que você aprendeu ou realizou?</p>
                                </div>

                                <textarea
                                    value={summaryText}
                                    onChange={(e) => setSummaryText(e.target.value)}
                                    placeholder="Escreva aqui seu resumo..."
                                    className="w-full flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none mb-4"
                                    autoFocus
                                />

                                <button
                                    onClick={handleFinalizeSession}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Salvar & Concluir</span>
                                </button>
                            </div>
                        )
                    ) : (
                        /* Progress Circle Large */
                        <div
                            onClick={handleToggleTimer}
                            className="relative w-72 h-72 mx-auto mb-10 flex items-center justify-center cursor-pointer group transition-transform"
                        >
                            <AnimatePresence mode="wait">
                                {showActivityHeadline ? (
                                    <motion.div
                                        key="headline"
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 1.1, y: -10 }}
                                        transition={{ duration: 0.8, ease: "circOut" }}
                                        className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/50 mb-3"
                                        >
                                            Focando em
                                        </motion.div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                                            {activeFocus.title}
                                        </h2>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "40%" }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent mt-6 opacity-30"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="timer"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 1.2 }}
                                        className="relative w-full h-full flex items-center justify-center"
                                    >
                                        <div className="absolute inset-0 animate-spin" style={{ animationPlayState: isActive ? 'running' : 'paused' }}>
                                            <svg className="w-full h-full -rotate-90">
                                                <circle
                                                    cx="144" cy="144" r="130"
                                                    className="fill-none stroke-slate-800/50"
                                                    strokeWidth="8"
                                                />
                                                <motion.circle
                                                    cx="144" cy="144" r="130"
                                                    className={cn(
                                                        "fill-none stroke-current",
                                                        mode === 'focus' ? "text-rose-500" :
                                                            mode === 'shortBreak' ? "text-emerald-500" : "text-blue-500"
                                                    )}
                                                    strokeWidth="8"
                                                    strokeDasharray="816" // 2 * PI * 130
                                                    animate={{ strokeDashoffset: 816 - (816 * (1 - circleProgress / 100)) }}
                                                    strokeLinecap="round"
                                                    transition={{ duration: 1, ease: "linear" }}
                                                />
                                            </svg>
                                        </div>

                                        <div className="text-center z-10 select-none">
                                            <div className={cn(
                                                "text-7xl font-mono font-black tracking-tighter tabular-nums",
                                                mode === 'focus' ? 'text-white' :
                                                    mode === 'shortBreak' ? 'text-emerald-500' : 'text-blue-500'
                                            )}>
                                                {formatTime(timeLeft)}
                                            </div>
                                            <div className="flex justify-center gap-1.5 mt-6">
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "w-2.5 h-2.5 rounded-full transition-colors",
                                                            i < (cycles % 4) ? (mode === 'focus' ? "bg-rose-500" : "bg-blue-400") : "bg-slate-700"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Controls */}
                    {!showValidate && (
                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex items-center justify-center gap-6">
                                <button
                                    onClick={resetTimer}
                                    className="p-4 rounded-2xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all active:scale-90"
                                >
                                    <RefreshCw className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={handleToggleTimer}
                                    className={cn(
                                        "w-20 h-20 flex items-center justify-center rounded-[2rem] shadow-2xl transition-all active:scale-95 text-white",
                                        "bg-gradient-to-br",
                                        mode === 'focus' ? "from-rose-500 to-rose-600 shadow-rose-500/30" :
                                            mode === 'shortBreak' ? "from-emerald-500 to-emerald-600 shadow-emerald-500/30" :
                                                "from-blue-500 to-blue-600 shadow-blue-500/30"
                                    )}
                                >
                                    {isActive ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-2" />}
                                </button>

                                <button
                                    onClick={skipTimer}
                                    className="p-4 rounded-2xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all active:scale-90"
                                >
                                    <SkipForward className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};
