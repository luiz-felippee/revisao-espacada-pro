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

    const claimDailyReward = async (): Promise<{ claimed: boolean, xpAmount: number }> => {
        const today = GamificationService.getToday();

        // 1. Lógica Offline / Sem Login
        if (!user) {
            const result = GamificationService.claimDailyReward(gamification);
            if (result.claimed) {
                playXPSound();
                showToast(`+${result.xpAmount} XP (Recompensa Diária)`, "success");
                setGamification(result.newState);
            }
            return { claimed: result.claimed, xpAmount: result.xpAmount };
        }

        try {
            // 2. Verificar estado no servidor (Fonte da Verdade)
            const { data, error } = await supabase
                .from('profiles')
                .select('gamification')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Erro ao verificar recompensa no servidor:', error);
                throw error; // Fallback no catch
            }

            // Usar estado do servidor se disponível, senão o local
            let baseState = (data?.gamification as GamificationState) || gamification;

            // Proteção contra estrutura inválida
            if (!baseState.level) baseState = gamification;

            // 3. Verificar se já coletou HOJE no servidor
            if (baseState.streak?.lastDailyRewardDate === today) {
                console.log('Recompensa já coletada no servidor.');
                setGamification(baseState); // Atualiza local para refletir a verdade
                return { claimed: false, xpAmount: 0 };
            }

            // 4. Processar coleta
            const result = GamificationService.claimDailyReward(baseState);

            if (result.claimed) {
                // Atualizar estado local
                setGamification(result.newState);
                playXPSound();
                showToast(`+${result.xpAmount} XP (Recompensa Diária)`, "success");

                // 5. Salvar no Servidor (Critical Path)
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ gamification: result.newState })
                    .eq('id', user.id);

                if (updateError) {
                    // Se falhar o save, enfileira para tentar depois
                    console.warn('Falha ao salvar recompensa, enfileirando sync:', updateError);
                    SyncQueueService.enqueue({
                        type: 'UPDATE',
                        table: 'profiles',
                        data: { id: user.id, gamification: result.newState } as any
                    });
                }
            }

            return { claimed: result.claimed, xpAmount: result.xpAmount };

        } catch (err) {
            // Fallback para comportamento local otimista em caso de erro de rede
            console.warn('Fallback local para Daily Reward devido a erro:', err);
            const result = GamificationService.claimDailyReward(gamification);

            if (result.claimed) {
                setGamification(result.newState);
                playXPSound();
                showToast(`+${result.xpAmount} XP (Offline)`, "success");

                SyncQueueService.enqueue({
                    type: 'UPDATE',
                    table: 'profiles',
                    data: { id: user.id, gamification: result.newState } as any
                });
            }
            return { claimed: result.claimed, xpAmount: result.xpAmount };
        }
    };

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
            resetGamification,
            claimDailyReward
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
