import { useState, useEffect, useRef, useCallback } from 'react';

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const SETTINGS = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    cyclesForLongBreak: 4,
};

export const usePomodoro = () => {
    const [mode, setMode] = useState<Mode>('focus');
    const [timeLeft, setTimeLeft] = useState(SETTINGS.focus);
    const [isActive, setIsActive] = useState(false);
    const [cycles, setCycles] = useState(0);

    // Audio ref (we'll create an Audio object)
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple clear bell
    }, []);

    const playSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }
    }, []);

    const switchMode = useCallback((nextMode: Mode) => {
        setMode(nextMode);
        setTimeLeft(SETTINGS[nextMode]);
        setIsActive(false);
    }, []);

    const handleTimerComplete = useCallback(() => {
        playSound();

        if (mode === 'focus') {
            const newCycles = cycles + 1;
            setCycles(newCycles);

            if (newCycles % SETTINGS.cyclesForLongBreak === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            // Break is over, back to work!
            switchMode('focus');
        }
    }, [mode, cycles, playSound, switchMode]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, handleTimerComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(SETTINGS[mode]);
    };

    const skipTimer = () => {
        handleTimerComplete();
    };

    return {
        mode,
        timeLeft,
        isActive,
        cycles,
        toggleTimer,
        resetTimer,
        skipTimer,
        settings: SETTINGS
    };
};
