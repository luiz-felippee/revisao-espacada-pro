import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AudioContext, type SoundType } from './AudioContext';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const [volume, setVolumeState] = useState(() => {
        const saved = localStorage.getItem('audio_volume');
        const parsed = saved ? parseFloat(saved) : 0.2;
        return isFinite(parsed) ? parsed : 0.2; // Protection against NaN
    });

    const [currentSound, setCurrentSoundState] = useState<SoundType>(() => {
        const saved = localStorage.getItem('audio_sound');
        return (saved as SoundType) || 'white';
    });

    const volumeRef = useRef(volume);
    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const rainAudioRef = useRef<HTMLAudioElement | null>(null);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            if (!Ctx) {
                console.warn("AudioContext not supported in this browser");
                return;
            }
            audioCtxRef.current = new Ctx();

            if (!audioCtxRef.current) return;

            gainNodeRef.current = audioCtxRef.current.createGain();
            gainNodeRef.current.connect(audioCtxRef.current.destination);
            gainNodeRef.current.gain.value = volumeRef.current;
        }
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume().catch(e => console.warn("Audio resume failed", e));
        }
    }, []);

    const createNoiseBuffer = (type: 'white' | 'pink' | 'brown'): AudioBuffer | null => {
        const ctx = audioCtxRef.current;
        if (!ctx) return null;

        const bufferSize = 2 * ctx.sampleRate; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11;
                b6 = white * 0.115926;
            }
        } else if (type === 'brown') {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        }
        return buffer;
    };

    const stopAudio = useCallback(() => {
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.disconnect();
            } catch { /* ignore */ }
            sourceNodeRef.current = null;
        }
        if (rainAudioRef.current) {
            rainAudioRef.current.pause();
            rainAudioRef.current.currentTime = 0;
        }
    }, []);

    const playAudio = useCallback(() => {
        initAudio();
        stopAudio();

        if (currentSound === 'rain') {
            if (!rainAudioRef.current) {
                rainAudioRef.current = new Audio('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg');
                rainAudioRef.current.loop = true;
            }
            rainAudioRef.current.volume = volumeRef.current;
            rainAudioRef.current.play().catch(e => console.error(e));
        } else {
            if (currentSound !== 'rain') {
                const buffer = createNoiseBuffer(currentSound);
                if (!buffer || !audioCtxRef.current || !gainNodeRef.current) return;

                const source = audioCtxRef.current.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                source.connect(gainNodeRef.current);
                source.start();
                sourceNodeRef.current = source;
            }
        }
    }, [currentSound, initAudio, stopAudio]);

    useEffect(() => {
        if (isPlaying) {
            playAudio();
        } else {
            stopAudio();
        }
    }, [isPlaying, currentSound, playAudio, stopAudio]);

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume;
        }
        if (rainAudioRef.current) {
            rainAudioRef.current.volume = volume;
        }
        localStorage.setItem('audio_volume', volume.toString());
    }, [volume]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const setVolume = (vol: number) => setVolumeState(vol);
    const setSound = (sound: SoundType) => {
        setCurrentSoundState(sound);
        localStorage.setItem('audio_sound', sound);
    };

    const startAudioFn = () => {
        if (!isPlaying) {
            setIsPlaying(true);
        }
    };

    const stopAudioFn = () => {
        if (isPlaying) {
            setIsPlaying(false);
        }
    };

    const playSFX = (type: 'success' | 'xp' | 'achievement' | 'levelUp') => {
        try {
            initAudio();
            const ctx = audioCtxRef.current;
            if (!ctx || ctx.state === 'suspended') return;

            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case 'levelUp':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(220, now);
                    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.5);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
                    gain.gain.linearRampToValueAtTime(0, now + 0.8);
                    oscillator.start(now);
                    oscillator.stop(now + 0.8);
                    break;
                case 'achievement':
                    [523.25, 659.25, 783.99].forEach((freq, i) => {
                        const osc = ctx.createOscillator();
                        const g = ctx.createGain();
                        osc.connect(g);
                        g.connect(ctx.destination);
                        osc.frequency.setValueAtTime(freq, now + i * 0.1);
                        g.gain.setValueAtTime(0, now + i * 0.1);
                        g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
                        g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.5);
                        osc.start(now + i * 0.1);
                        osc.stop(now + i * 0.1 + 0.5);
                    });
                    break;
                case 'xp':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, now);
                    oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
                    gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
                case 'success':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(523.25, now);
                    oscillator.frequency.setValueAtTime(659.25, now + 0.1);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
                    gain.gain.linearRampToValueAtTime(0, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                    break;
            }
        } catch (e) {
            console.warn("SFX play failed", e);
        }
    };

    return (
        <AudioContext.Provider value={{
            isPlaying,
            volume,
            currentSound,
            togglePlay,
            setVolume,
            setSound,
            startAudio: startAudioFn,
            stopAudio: stopAudioFn,
            playSFX
        }}>
            {children}
        </AudioContext.Provider>
    );
};
