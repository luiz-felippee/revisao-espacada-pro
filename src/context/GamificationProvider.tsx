import React, { useState, useEffect } from 'react';
import { useAudio } from './AudioContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { GamificationService } from '../services/GamificationService';
import type { Achievement, GamificationState, GameStats } from '../types/gamification';
import { SyncQueueService } from '../services/SyncQueueService';
import { useToast } from './ToastContext';
import { GamificationContext } from './GamificationContext';
import { useDebounce, useThrottle } from '../hooks/useOptimization';

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [gamification, setGamification] = useState<GamificationState>(GamificationService.getInitialState());
    const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const { playSFX } = useAudio();
    const { showToast } = useToast();

    // Throttle XP sound to play at most once every 2 seconds to avoid spam
    const playXPSound = useThrottle(() => playSFX('xp'), 2000);
    const playLevelUpSound = () => playSFX('levelUp');
    const playAchievementSound = () => playSFX('achievement');

    // Initial load from Supabase if user exists
    useEffect(() => {
        const loadGamification = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('gamification')
                    .eq('id', user.id) // Reverted: user_id does not exist
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching gamification data:', error);
                    setHasLoaded(true); // Treat as loaded to allow local progress
                    return;
                }

                let loadedState = GamificationService.getInitialState();

                if (data?.gamification) {
                    // Ensure it has the correct structure (level is required)
                    if (data.gamification.level) {
                        loadedState = data.gamification;
                    } else {
                        console.warn('Empty or invalid gamification data received, keeping initial state');
                    }
                }

                // Check Streak immediately on load
                const { newState, newUnlock } = GamificationService.checkStreak(loadedState);

                setGamification(newState);
                if (newUnlock) setNewlyUnlocked(newUnlock);

                // If streak updated (state changed), we should sync back to server
                // We can detect if 'lastLoginDate' changed or just always sync to be safe/consistent?
                // checkStreak returns same object if no change? 
                // GamificationService.checkStreak returns { newState: state... } if no change.
                // But we constructed a new object structure in service... actually checkStreak returns `state` ref if no change in line 112: `return { newState: state, newUnlock: null }; `
                // So strict equality check works.

                if (newState !== loadedState) {
                    // Queue Sync if changed
                    // We need to wait for state set? No, we can enqueue directly.
                    // But we need to make sure we don't block render.
                    // We'll defer the sync call or just let the handleGamificationUpdate equivalent logic run.
                    // Since we are inside useEffect using local vars, we can't use 'gamification' state yet.
                    // We'll manually queue sync here.
                    SyncQueueService.enqueue({
                        type: 'UPDATE',
                        table: 'profiles',
                        data: {
                            id: user.id,
                            gamification: newState
                        } as any // profiles table has gamification column not in PartialDbPayload
                    });
                }

                setHasLoaded(true);
            } else {
                setHasLoaded(false);
            }
        };
        loadGamification();
    }, [user]);

    const handleGamificationUpdate = async (result: { newState: GamificationState, newUnlock: Achievement | null }) => {
        // Check for Level Up
        if (result.newState.level.level > gamification.level.level) {
            playLevelUpSound();
        }

        // Check for Achievement
        if (result.newUnlock) {
            setNewlyUnlocked(result.newUnlock);
            playAchievementSound();
        }

        setGamification(result.newState);

        // Sync to Supabase...
        if (user && hasLoaded) {
            // Use SyncQueue to handle offline updates
            // (Import SyncQueueService at top of file first)
            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'profiles',
                data: {
                    id: user.id,
                    gamification: result.newState
                } as any // profiles table has gamification column not in PartialDbPayload
            });
        }
    };

    const awardXP = (amount: number, silent: boolean = false) => {
        if (amount > 0) {
            playXPSound();
            if (!silent) {
                showToast(`+ ${amount} XP`, "success");
            }
        }
        const result = GamificationService.awardXP(gamification, amount);
        handleGamificationUpdate(result);
    };

    const updateStats = (updates: Partial<GameStats>) => {
        const result = GamificationService.updateStats(gamification, updates);
        handleGamificationUpdate(result);
    };

    const dismissAchievement = () => setNewlyUnlocked(null);

    const resetGamification = async () => {
        const initialState = GamificationService.getInitialState();
        setGamification(initialState);
        if (user) {
            await supabase.from('profiles').update({ gamification: initialState }).eq('id', user.id);
        }
    };

    return (
        <GamificationContext.Provider value={{
            gamification,
            newlyUnlocked,
            awardXP,
            updateStats,
            dismissAchievement,
            resetGamification
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

// export const useGamification = () => {
//     const context = useContext(GamificationContext);
//     if (context === undefined) {
//         throw new Error('useGamification must be used within a GamificationProvider');
//     }
//     return context;
// };
