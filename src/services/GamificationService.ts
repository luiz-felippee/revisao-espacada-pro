import { format, subDays } from 'date-fns';
import type { Achievement, GameStreak, GamificationState, GameStats, UserLevel } from '../types/gamification';
import { GAME_ACHIEVEMENTS } from '../config/achievements';

/**
 * Serviço de gamificação e progressão do usuário.
 * 
 * Gerencia o sistema de XP, níveis, conquistas (achievements) e streaks,
 * proporcionando engajamento contínuo através de recompensas e progressão.
 * 
 * ## Sistema de XP
 * 
 * ### Fórmulas de XP por Atividade
 * 
 * **Reviews (Revisões SRS):**
 * - Base: 50 XP
 * - Bônus de dificuldade:
 *   - Easy: +0 XP
 *   - Medium: +25 XP  
 *   - Hard: +50 XP
 * - Bônus de consistência: +10 XP por dia consecutivo (máx 100 XP)
 * 
 * **Tasks (Tarefas):**
 * - Simples: 20 XP
 * - Com duração estimada: 20 + (duração × 2) XP
 * - Prioridade alta: +15 XP
 * 
 * **Goals (Metas):**
 * - Base: 100 XP
 * - Bônus de progresso: progresso × 2 XP
 * - Meta completa (100%): +200 XP
 * 
 * **Habits (Hábitos Diários):**
 * - Por conclusão: 30 XP
 * - Streak de 7 dias: +50 XP bônus
 * 
 * ## Sistema de Níveis
 * 
 * ### Fórmula de Progressão
 * 
 * XP necessário para próximo nível = `nextLevelXp × 1.2` (curva exponencial balanceada)
 * 
 * | Nível | XP Necessário | XP Total Acumulado |
 * |-------|---------------|--------------------|
 * | 1 | 500 | 0 |
 * | 2 | 600 | 500 |
 * | 3 | 720 | 1,100 |
 * | 5 | 1,037 | 2,257 |
 * | 10 | 2,641 | 10,385 |
 * | 20 | 16,367 | 72,890 |
 * 
 * ## Conquistas (Achievements)
 * 
 * Triggers automáticos baseados em:
 * - Total de XP acumulado
 * - Número de reviews completadas
 * - Número de tasks completadas
 * - Streak de dias consecutivos
 * 
 * @example
 * ```typescript
 * // Dar XP ao completar review difícil com streak de 5 dias
 * const { newState, newUnlock } = GamificationService.awardXP(state, 100);
 * // 50 (base) + 50 (hard) = 100 XP
 * 
 * if (newUnlock) {
 *   console.log('🏆 Conquista desbloqueada:', newUnlock.title);
 * }
 * 
 * // Verificar streak diário
 * const { newState, newUnlock } = GamificationService.checkStreak(state);
 * // Incrementa streak se login foi ontem, reseta se > 1 dia
 * ```
 */
export class GamificationService {
    static getToday(): string {
        return format(new Date(), 'yyyy-MM-dd');
    }

    static getInitialState(): GamificationState {
        return {
            level: { level: 1, currentXp: 0, nextLevelXp: 500, totalXp: 0 },
            streak: { current: 1, max: 1, lastLoginDate: this.getToday() },
            achievements: [],
            stats: {
                reviewsCompleted: 0,
                tasksCompleted: 0,
                goalsCompleted: 0,
                habitsCompleted: 0,
                totalFocusMinutes: 0,
                dailyXp: 0,
                lastXpDate: this.getToday(),
                dailyHistory: {}
            }
        };
    }

    static checkAchievements(currentStats: GameStats, currentLevel: number, currentStreak: number, currentAchievements: Achievement[]): Achievement[] {
        const unlocked: Achievement[] = [];

        GAME_ACHIEVEMENTS.forEach(config => {
            // Skip if already unlocked
            if (currentAchievements && currentAchievements.some(a => a.id === config.id)) return;

            let conditionMet = false;
            const { type, target } = config.condition;

            switch (type) {
                case 'xp':
                    // We don't have total XP in stats easily accessible without full state, 
                    // but usually 'xp' achievements are checked against level or total.
                    // For safety, let's assume 'xp' target means Total XP here or just ignore if data missing
                    // Actually, let's map 'xp' to Level checks for simplicity or remove XP achievements if vague.
                    // Or check external stat if we had it.
                    // Implementation Detail: We'll skip 'xp' here and rely on awardXP checking it.
                    break;
                case 'reviews':
                    conditionMet = currentStats.reviewsCompleted >= target;
                    break;
                case 'tasks':
                    conditionMet = currentStats.tasksCompleted >= target;
                    break;
                case 'streak':
                    conditionMet = currentStreak >= target;
                    break;
            }

            if (conditionMet) {
                unlocked.push({
                    ...config,
                    unlockedAt: new Date().toISOString()
                });
            }
        });

        return unlocked;
    }

    static updateStats(state: GamificationState, updates: Partial<GameStats>): { newState: GamificationState, newUnlock: Achievement | null } {
        const today = this.getToday();
        const currentStats = { ...state.stats };

        // Daily XP Reset
        if (currentStats.lastXpDate !== today) {
            currentStats.dailyXp = 0;
            currentStats.lastXpDate = today;
        }

        const newStats = { ...currentStats, ...updates };
        if (!newStats.dailyHistory) newStats.dailyHistory = {};

        const newUnlocks = this.checkAchievements(newStats, state.level.level, state.streak?.current || 1, state.achievements || []);

        return {
            newState: {
                ...state,
                stats: newStats,
                achievements: [...(state.achievements || []), ...newUnlocks]
            },
            newUnlock: newUnlocks.length > 0 ? newUnlocks[0] : null
        };
    }

    static checkStreak(state: GamificationState): { newState: GamificationState, newUnlock: Achievement | null } {
        const today = this.getToday();
        const streak = { ...state.streak };
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        // Check if already updated today
        if (streak.lastLoginDate === today) {
            return { newState: state, newUnlock: null };
        }

        // Logic
        if (streak.lastLoginDate === yesterday) {
            streak.current += 1;
            streak.max = Math.max(streak.current, streak.max);
        } else {
            // Only reset if it's strictly older than yesterday (missed a day)
            // If it's empty/null (new user), we treat as 1
            streak.current = 1;
        }
        streak.lastLoginDate = today;

        // Reset Daily Stats
        const stats = { ...state.stats };
        if (stats.lastXpDate !== today) {
            stats.dailyXp = 0;
            stats.lastXpDate = today;
        }

        // Check Achievements (e.g. 7 day streak)
        const newUnlocks = this.checkAchievements(stats, state.level.level, streak.current, state.achievements || []);

        return {
            newState: {
                ...state,
                streak,
                stats,
                achievements: [...(state.achievements || []), ...newUnlocks]
            },
            newUnlock: newUnlocks.length > 0 ? newUnlocks[0] : null
        };
    }


    /**
     * Concede XP ao usuário e processa level ups e conquistas.
     * 
     * Este é o método principal do sistema de gamificação, responsável por:
     * 1. Atualizar streak diário
     * 2. Adicionar XP ao total do usuário
     * 3. Processar level ups (com curva balanceada)
     * 4. Verificar e desbloquear conquistas
     * 5. Atualizar estatísticas diárias
     * 
     * ## Fluxo de Processamento
     * 
     * ```
     * awardXP(state, amount)
     *   ├─> checkStreakAutomaticamente atualiza streak se necessário)
     *   ├─> Adicionar XP (currentXp + totalXp)
     *   ├─> Verificar Level Up
     *   │     └─> Se currentXp >= nextLevelXp:
     *   │           ├─> Incrementar nível
     *   │           └─> nextLevelXp = nextLevelXp × 1.2
     *   ├─> Verificar Conquistas
     *   │     ├─> Por XP total
     *   │     ├─> Por stats (reviews, tasks)
     *   │     └─> Por streak
     *   └─> Retornar novo estado + conquista desbloqueada
     * ```
     * 
     * ## Prevenção de Exploits
     * 
     * - **Clamping:** XP nunca fica negativo
     * - **Daily Limits:** Conquistas verificam valores acumulados, não diários
     * - **Deduplicação:** Conquistas já desbloqueadas são ignoradas
     * 
     * @param state - Estado atual da gamificação
     * @param amount - Quantidade de XP a ser concedida (pode ser negativa para penalidades)
     * @returns Objeto com novo estado e conquista desbloqueada (se houver)
     * 
     * @example
     * ```typescript
     * // Completar review difícil
     * const { newState, newUnlock } = GamificationService.awardXP(
     *   currentState,
     *   100  // 50 base + 50 hard
     * );
     * 
     * // Verificar se subiu de nível
     * if (newState.level.level > currentState.level.level) {
     *   console.log('🎉 Level Up!', newState.level.level);
     * }
     * 
     * // Verificar conquista
     * if (newUnlock) {
     *   showToast(`🏆 Conquista: ${newUnlock.title}`);
     * }
     * 
     * // Completar task simples
     * const result = GamificationService.awardXP(currentState, 20);
     * 
     * // Penalidade (XP negativo é clamped para 0)
     * const penalized = GamificationService.awardXP(currentState, -50);
     * // currentXp não será < 0
     * ```
     */
    static awardXP(state: GamificationState, amount: number): { newState: GamificationState, newUnlock: Achievement | null } {
        // 1. First ensure streak/day is up to date
        const { newState: stateWithStreak, newUnlock: streakUnlock } = this.checkStreak(state);

        let { level, currentXp, nextLevelXp, totalXp } = stateWithStreak.level;
        const currentStats = { ...stateWithStreak.stats };

        currentXp += amount;
        totalXp += amount;

        // Prevent negative XP (Clamping)
        if (currentXp < 0) currentXp = 0;
        if (totalXp < 0) totalXp = 0;

        currentStats.dailyXp += amount;

        // Level Up Checking
        if (currentXp >= nextLevelXp) {
            currentXp -= nextLevelXp;
            level += 1;
            nextLevelXp = Math.floor(nextLevelXp * 1.2); // Balanced curve
        }

        const newUnlocks = this.checkAchievements(currentStats, level, stateWithStreak.streak.current, stateWithStreak.achievements || []);

        // Combine unlocks (Streak unlock + XP unlock)
        const allUnlocks = [...newUnlocks];
        if (streakUnlock) allUnlocks.push(streakUnlock);

        // Also check XP specific achievements
        GAME_ACHIEVEMENTS.filter(a => a.condition.type === 'xp').forEach(a => {
            if (!stateWithStreak.achievements?.some(ex => ex.id === a.id) && totalXp >= a.condition.target) {
                if (!allUnlocks.some(u => u.id === a.id)) {
                    allUnlocks.push({ ...a, unlockedAt: new Date().toISOString() });
                }
            }
        });

        return {
            newState: {
                ...stateWithStreak,
                level: { level, currentXp, nextLevelXp, totalXp },
                stats: currentStats,
                achievements: [...(stateWithStreak.achievements || []), ...allUnlocks]
            },
            newUnlock: allUnlocks.length > 0 ? allUnlocks[0] : null
        };
    }
}
