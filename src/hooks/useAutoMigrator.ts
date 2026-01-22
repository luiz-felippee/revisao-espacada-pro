import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

/**
 * 🔄 Auto-Migrator: Migra tasks antigas do localStorage para Supabase
 * 
 * Roda automaticamente quando o app carrega
 * Detecta tasks que estão só no localStorage
 * Migra elas para o Supabase automaticamente
 */
export const useAutoMigrator = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const migrateOldTasks = async () => {
            try {
                logger.info('[AutoMigrator] 🔄 Iniciando verificação de migração...');

                // 1. Pegar tasks do localStorage
                const localTasks = localStorage.getItem('study_tasks_backup');
                if (!localTasks) {
                    logger.info('[AutoMigrator] ✅ Nenhuma task em cache local');
                    return;
                }

                let tasks: any[] = [];
                try {
                    tasks = JSON.parse(localTasks);
                } catch (e) {
                    logger.error('[AutoMigrator] ❌ Erro ao ler localStorage:', e);
                    return;
                }

                if (tasks.length === 0) {
                    logger.info('[AutoMigrator] ✅ Cache local vazio');
                    return;
                }

                logger.info(`[AutoMigrator] 📦 Encontradas ${tasks.length} tasks no localStorage`);

                // 2. Verificar quais tasks já estão no Supabase
                const { data: supabaseTasks, error } = await supabase
                    .from('tasks')
                    .select('id')
                    .eq('user_id', user.id);

                if (error) {
                    logger.error('[AutoMigrator] ❌ Erro ao buscar tasks do Supabase:', error);
                    return;
                }

                const supabaseIds = new Set(supabaseTasks?.map(t => t.id) || []);
                logger.info(`[AutoMigrator] ✅ ${supabaseIds.size} tasks já estão no Supabase`);

                // 3. Identificar tasks que faltam
                const missingTasks = tasks.filter(t => !supabaseIds.has(t.id));

                if (missingTasks.length === 0) {
                    logger.info('[AutoMigrator] ✅ Todas as tasks já estão no Supabase!');
                    return;
                }

                logger.info(`[AutoMigrator] 🔄 ${missingTasks.length} tasks precisam ser migradas`);

                // 4. Migrar tasks faltantes
                let success = 0;
                let failed = 0;

                for (const task of missingTasks) {
                    const taskData = {
                        id: task.id,
                        user_id: user.id,
                        title: task.title,
                        status: task.status || 'pending',
                        priority: task.priority || 'medium',
                        type: task.type || 'day',
                        date: task.date || null,
                        start_date: task.startDate || null,
                        end_date: task.endDate || null,
                        recurrence: task.recurrence || null,
                        icon: task.icon || null,
                        color: task.color || null,
                        image_url: task.imageUrl || null,
                        duration_minutes: task.durationMinutes || null,
                        time_spent: task.timeSpent || 0,
                        completion_history: task.completionHistory || [],
                        sessions: task.sessions || [],
                        summaries: task.summaries || [],
                        created_at: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString()
                    };

                    const { error: insertError } = await supabase
                        .from('tasks')
                        .insert(taskData);

                    if (insertError) {
                        logger.error(`[AutoMigrator] ❌ Erro ao migrar "${task.title}":`, insertError.message);
                        failed++;
                    } else {
                        logger.info(`[AutoMigrator] ✅ Migrada: "${task.title}"`);
                        success++;
                    }
                }

                logger.info('[AutoMigrator] 📊 RESUMO DA MIGRAÇÃO:');
                logger.info(`[AutoMigrator] ✅ Migradas com sucesso: ${success}`);
                logger.info(`[AutoMigrator] ❌ Falhas: ${failed}`);
                logger.info(`[AutoMigrator] 📊 Total no Supabase (agora): ${supabaseIds.size + success}`);

                if (success > 0) {
                    logger.info('[AutoMigrator] 🎉 Migração concluída! Recarregando em 2 segundos...');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }

            } catch (error) {
                logger.error('[AutoMigrator] ❌ Erro na migração:', error);
            }
        };

        // 🔄 SEMPRE rodar migração - garante sync em TODOS dispositivos
        // Removida verificação de migrationDone para permitir sync cross-device
        migrateOldTasks();

    }, [user]);
};
