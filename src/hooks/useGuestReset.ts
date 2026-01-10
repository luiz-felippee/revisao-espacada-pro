import { useEffect } from 'react';
import { logger } from '../utils/logger';

// UUID fixo para usuários visitantes (Guest)
const GUEST_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Hook para realizar um "Hard Reset" em sessões de visitantes.
 * Limpa o localStorage para garantir que cada visitante comece do zero,
 * mas apenas uma vez por sessão de aba (usando sessionStorage).
 */
export const useGuestReset = (userId: string | undefined) => {
    useEffect(() => {
        if (userId === GUEST_ID) {
            const hasReset = sessionStorage.getItem('guest_reset_v3');
            if (!hasReset) {
                logger.info("🧹 Executando Hard Reset para sessão de visitante...");

                // Limpa chaves específicas de dados da aplicação
                localStorage.removeItem('study_themes_backup');
                localStorage.removeItem('deleted_theme_ids');
                localStorage.removeItem('sync_queue_v1');
                localStorage.removeItem('daily_unlocked_subthemes');
                localStorage.removeItem('active_focus_session');

                // Marca como resetado nesta sessão de aba
                sessionStorage.setItem('guest_reset_v3', 'true');

                // Recarrega para garantir que os contextos inicializem vazios
                window.location.reload();
            }
        }
    }, [userId]);
};
