import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';
import { PomodoroStateContext, PomodoroTimeContext, type PomodoroMode } from './PomodoroContext';
import { NotificationService } from '../services/NotificationService';
import { useAppContext } from './AppContext';

const SETTINGS = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    cyclesForLongBreak: 4,
    strictMode: false,
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Get App Context to properly set activeFocus
    const { startFocus: appContextStartFocus } = useAppContext();
    // 1. State Declarations
    const [mode, setMode] = useState<PomodoroMode>(() => {
        const saved = localStorage.getItem('pomodoro_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) return parsed.mode;
            } catch { /* ignore */ }
        }
        return 'focus';
    });
    const [settings, setSettings] = useState(SETTINGS);
    const [timeLeft, setTimeLeft] = useState(() => {
        // Don't restore timeLeft from storage to avoid NaN issues
        // It will be recalculated based on the current mode
        const saved = localStorage.getItem('pomodoro_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    // Calculate timeLeft based on saved mode
                    if (parsed.mode === 'focus') return SETTINGS.focus;
                    if (parsed.mode === 'shortBreak') return SETTINGS.shortBreak;
                    if (parsed.mode === 'longBreak') return SETTINGS.longBreak;
                }
            } catch { /* ignore */ }
        }
        return SETTINGS.focus;
    });
    const [isActive, setIsActive] = useState(() => {
        const saved = localStorage.getItem('pomodoro_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) return parsed.isActive;
            } catch { /* ignore */ }
        }
        return false;
    });
    const [cycles, setCycles] = useState(() => {
        const saved = localStorage.getItem('pomodoro_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) return parsed.cycles;
            } catch { /* ignore */ }
        }
        return 0;
    });
    const [linkedItemId, setLinkedItemId] = useState<string | null>(() => {
        const saved = localStorage.getItem('pomodoro_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) return parsed.linkedItemId;
            } catch { /* ignore */ }
        }
        return null;
    });
    const [isWidgetVisible, setIsWidgetVisible] = useState(false);

    // DEBUG: Track isWidgetVisible changes
    useEffect(() => {
        console.log('👁️ [POMODORO PROVIDER] isWidgetVisible changed to:', isWidgetVisible);
        console.trace('Changed from:');
    }, [isWidgetVisible]);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 2. Initialization & Persistence
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    // Persist state ONLY on component unmount to avoid infinite loop
    useEffect(() => {
        return () => {
            const state = { mode, isActive, cycles, linkedItemId, timestamp: Date.now() };
            localStorage.setItem('pomodoro_state', JSON.stringify(state));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps = only runs on mount/unmount

    // 3. Helper Functions
    const playSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((e: unknown) => logger.info('Audio play failed:', e));
        }
    }, []);

    // 4. Core Logic
    const updateSettings = (newSettings: Partial<typeof SETTINGS>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    // Override resetTimer to use dynamic settings
    const resetTimer = () => {
        console.log('🔄 [POMODORO] resetTimer called - pausing timer');
        console.trace('Reset called from:');
        setIsActive(false);
        setTimeLeft(settings[mode]);
    };

    const switchMode = useCallback((nextMode: PomodoroMode) => {
        setMode(nextMode);
        // Use functional update to access current settings without adding it to deps
        setTimeLeft(() => {
            if (nextMode === 'focus') return SETTINGS.focus;
            if (nextMode === 'shortBreak') return SETTINGS.shortBreak;
            return SETTINGS.longBreak;
        });
        setIsActive(false);
    }, []);

    const handleTimerComplete = useCallback(() => {
        playSound();

        // Send notification
        try {
            const isFocus = mode === 'focus';
            NotificationService.showNotification(
                isFocus ? '🎉 Foco Completo!' : '⏰ Pausa Terminada!',
                isFocus
                    ? 'Ótimo trabalho! Hora de fazer uma pausa.'
                    : 'Pausa terminada! Pronto para focar?',
                isFocus ? '🎉' : '⏰'
            );
        } catch (error) {
            logger.error('Error sending notification:', error);
        }

        if (mode === 'focus') {
            const newCycles = cycles + 1;
            setCycles(newCycles);

            if (newCycles % settings.cyclesForLongBreak === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('focus');
        }
    }, [mode, cycles, playSound, switchMode, settings]);

    const skipTimer = () => {
        handleTimerComplete();
    };

    // 5. Timer Effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time: number) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Use setTimeout to avoid synchronous state updates in effect
            const timer = setTimeout(() => {
                if (mode === 'focus' && isActive) {
                    setIsActive(false);
                    playSound();
                    setIsWidgetVisible(true);
                } else if (mode !== 'focus') {
                    handleTimerComplete();
                }
            }, 0);
            return () => clearTimeout(timer);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, handleTimerComplete, mode, playSound]);

    // 6. Public API Implementations
    const toggleTimer = () => {
        console.log('🔄 [POMODORO] toggleTimer called - current isActive:', isActive, '→ will be:', !isActive);
        console.trace('Toggle called from:');
        setIsActive(!isActive);
    };

    const startFocusSession = (itemId: string, type: 'task' | 'goal' | 'subtheme', title: string, durationMinutes?: number, reviewNumber?: number, reviewType?: 'review' | 'intro', parentId?: string) => {
        console.log('🎯 [POMODORO] startFocusSession called:', { itemId, type, title, durationMinutes });
        logger.info(`🚀 Starting focus session for ${itemId} (${type}: "${title}"), duration: ${durationMinutes || 25}min`);

        // 1. Reset state to prevent leaks
        setIsActive(false);
        console.log('⏸️ [POMODORO] Timer paused (isActive=false)');

        // 2. Set Context & Data
        appContextStartFocus(itemId, type, title, durationMinutes || 25, reviewNumber, reviewType, parentId);
        console.log('📝 [POMODORO] App context startFocus called');

        setLinkedItemId(itemId);
        setMode('focus');
        console.log('🎯 [POMODORO] Mode=focus, linkedItemId:', itemId);

        // 3. Set Time
        const durationSeconds = durationMinutes ? durationMinutes * 60 : settings.focus;
        setTimeLeft(durationSeconds);
        setIsWidgetVisible(true);
        console.log(`⏱️ [POMODORO] timeLeft=${durationSeconds}s, widgetVisible=true`);

        // 4. Activate - Use setTimeout to ensure all state updates are flushed first
        setTimeout(() => {
            setIsActive(true);
            console.log('▶️ [POMODORO] Timer ACTIVATED (isActive=true)');
            logger.info(`✅ Timer activated: isActive=true, timeLeft=${durationSeconds}s, widget visible`);
        }, 50);

        console.log('✅ [POMODORO] startFocusSession complete, waiting for setTimeout...');
        logger.info(`✅ Focus session state prepared, activating timer...`);
    };

    const closeWidget = () => {
        console.log('🚪 [POMODORO] closeWidget called - setting isWidgetVisible=false');
        console.trace('❌ Closing widget from:');
        setIsWidgetVisible(false);
    };
    const openWidget = () => {
        console.log('🚪 [POMODORO] openWidget called - setting isWidgetVisible=true');
        console.trace('✅ Opening widget from:');
        setIsWidgetVisible(true);
    };

    // Memoize the state & actions object to avoid re-renders when time changes
    // Only include stable dependencies or things that don't tick every second
    const stateValue = React.useMemo(() => ({
        mode,
        isActive,
        cycles,
        linkedItemId,
        isWidgetVisible,
        settings: {
            focusDuration: settings.focus / 60,
            shortBreakDuration: settings.shortBreak / 60,
            longBreakDuration: settings.longBreak / 60,
            strictMode: settings.strictMode
        },
        updateSettings: (s: { focusDuration: number; shortBreakDuration: number; longBreakDuration: number; strictMode: boolean }) => updateSettings({
            focus: s.focusDuration * 60,
            shortBreak: s.shortBreakDuration * 60,
            longBreak: s.longBreakDuration * 60,
            strictMode: s.strictMode
        }),
        toggleTimer,
        resetTimer,
        skipTimer,
        startFocusSession,
        closeWidget,
        openWidget
    }), [mode, isActive, cycles, linkedItemId, isWidgetVisible, settings, toggleTimer, resetTimer, skipTimer, startFocusSession, closeWidget, openWidget]);

    return (
        <PomodoroStateContext.Provider value={stateValue}>
            <PomodoroTimeContext.Provider value={timeLeft}>
                {children}
            </PomodoroTimeContext.Provider>
        </PomodoroStateContext.Provider>
    );
};
