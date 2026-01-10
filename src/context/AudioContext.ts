import { createContext, useContext } from 'react';

export type SoundType = 'white' | 'pink' | 'brown' | 'rain';

export interface AudioContextType {
    isPlaying: boolean;
    volume: number;
    currentSound: SoundType;
    togglePlay: () => void;
    setVolume: (vol: number) => void;
    setSound: (sound: SoundType) => void;
    startAudio: () => void;
    stopAudio: () => void;
    playSFX: (type: 'success' | 'xp' | 'achievement' | 'levelUp') => void;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within AudioProvider');
    return context;
};
