import React, { useState, useEffect } from 'react';
import { Howl } from 'howler';
import { Volume2, VolumeX, CloudRain, Wind, Radio, Play, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SOUNDS = [
    { id: 'rain', label: 'Chuva', icon: CloudRain, src: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3', color: 'text-blue-400' },
    { id: 'white', label: 'Ruído Branco', icon: Radio, src: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-1262.mp3', color: 'text-slate-400' },
    { id: 'wind', label: 'Vento', icon: Wind, src: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-through-trees-1224.mp3', color: 'text-emerald-400' },
];

export const FocusSoundsPlayer = () => {
    const [currentSound, setCurrentSound] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [howl, setHowl] = useState<Howl | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        return () => {
            if (howl) howl.unload();
        };
    }, [howl]);

    const toggleSound = (soundId: string) => {
        if (currentSound === soundId && isPlaying) {
            howl?.pause();
            setIsPlaying(false);
            return;
        }

        if (howl) {
            howl.stop();
        }

        const sound = SOUNDS.find(s => s.id === soundId);
        if (sound) {
            const newHowl = new Howl({
                src: [sound.src],
                html5: true,
                loop: true,
                volume: volume,
            });
            newHowl.play();
            setHowl(newHowl);
            setCurrentSound(soundId);
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (howl) howl.volume(newVol);
    };

    const activeSound = SOUNDS.find(s => s.id === currentSound);

    return (
        <div className="relative">
            {/* Minimized / Trigger */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all border",
                    isPlaying
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "bg-slate-800/50 text-slate-400 border-white/5 hover:bg-white/10"
                )}
            >
                {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">
                    {isPlaying ? activeSound?.label : "Sons"}
                </span>
            </button>

            {/* Expanded Menu */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-3 w-64 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 ring-1 ring-white/5"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ambiente</h4>
                            {isPlaying && (
                                <div className="flex items-center gap-1">
                                    <span className="w-0.5 h-2 bg-indigo-500 animate-[bounce_1s_infinite]" />
                                    <span className="w-0.5 h-3 bg-indigo-500 animate-[bounce_1.2s_infinite]" />
                                    <span className="w-0.5 h-2 bg-indigo-500 animate-[bounce_0.8s_infinite]" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-4">
                            {SOUNDS.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => toggleSound(sound.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2 rounded-xl transition-all border",
                                        currentSound === sound.id && isPlaying
                                            ? "bg-indigo-600/20 border-indigo-500/30 shadow-inner"
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-1.5 rounded-lg", currentSound === sound.id && isPlaying ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400")}>
                                            <sound.icon className="w-4 h-4" />
                                        </div>
                                        <span className={cn("text-xs font-bold", currentSound === sound.id && isPlaying ? "text-indigo-200" : "text-slate-300")}>
                                            {sound.label}
                                        </span>
                                    </div>
                                    {currentSound === sound.id && isPlaying && <Play className="w-3 h-3 text-indigo-400 fill-current" />}
                                </button>
                            ))}
                        </div>

                        {/* Volume Slider */}
                        <div className="flex items-center gap-3 px-1">
                            <Volume2 className="w-3 h-3 text-slate-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
