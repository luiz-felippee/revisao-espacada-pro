import React, { useState, useEffect } from 'react';
import { SyncQueueService } from '../services/SyncQueueService';
import { RealtimeService } from '../services/RealtimeService';
import { syncLogger } from '../utils/logger';
import { format } from 'date-fns';
import { AppContext, type ActiveFocusSession } from './AppContext';
import { useAuth } from './AuthContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

    // Initialize activeFocus from localStorage
    const [activeFocus, setActiveFocus] = useState<ActiveFocusSession | null>(() => {
        try {
            const saved = localStorage.getItem('active_focus_session');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    // Persist activeFocus changes
    useEffect(() => {
        if (activeFocus) {
            localStorage.setItem('active_focus_session', JSON.stringify(activeFocus));
        } else {
            localStorage.removeItem('active_focus_session');
        }
    }, [activeFocus]);

    const [activeStudySession, setActiveStudySession] = useState<string | null>(null);

    // Zen Mode State
    const [zenMode, setZenMode] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('zen_mode');
            return saved ? JSON.parse(saved) : false;
        } catch { return false; }
    });



    // Strict Summary Access Logic
    const [unlockedSubthemes] = useState<string[]>(() => {
        const saved = localStorage.getItem('daily_unlocked_subthemes');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.date === format(new Date(), 'yyyy-MM-dd')) {
                    return parsed.ids || [];
                }
            } catch (err) { console.error(err); }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('daily_unlocked_subthemes', JSON.stringify({
            date: format(new Date(), 'yyyy-MM-dd'),
            ids: unlockedSubthemes
        }));
    }, [unlockedSubthemes]);

    // Force Zen Mode off on Mobile to prevent UI break
    useEffect(() => {
        const checkMobileZen = () => {
            if (window.innerWidth < 768 && zenMode) {
                console.log('📱 Disabling Zen Mode on Mobile');
                setZenMode(false);
            }
        };

        checkMobileZen(); // Check on mount/update
        window.addEventListener('resize', checkMobileZen);
        return () => window.removeEventListener('resize', checkMobileZen);
    }, [zenMode]);

    // Broadcast Channel for Multi-Tab Sync
    useEffect(() => {
        const channel = new BroadcastChannel('study_sync_channel');

        channel.onmessage = (event) => {
            const { type, payload } = event.data;

            if (type === 'FOCUS_UPDATE') {
                console.log('🔄 Syncing Focus from another tab:', payload);
                // Directly set state, skipping local storage loop if handled there
                setActiveFocus(payload);
            } else if (type === 'ZEN_MODE_UPDATE') {
                console.log('🔄 Syncing Zen Mode from another tab:', payload);
                setZenMode(payload);
            }
        };

        return () => channel.close();
    }, []);

    const startFocus = (id: string, type: 'task' | 'goal' | 'subtheme', title: string, duration: number, reviewNumber?: number, reviewType?: 'review' | 'intro', parentId?: string) => {
        const newSession: ActiveFocusSession = { id, type, title, duration, startTime: Date.now(), reviewNumber, reviewType, parentId };
        setActiveFocus(newSession);

        // Broadcast
        const channel = new BroadcastChannel('study_sync_channel');
        channel.postMessage({ type: 'FOCUS_UPDATE', payload: newSession });
        channel.close();
    };

    const endFocus = (_completed: boolean = false, checkId?: string) => {
        setActiveFocus(prev => {
            // Prevent race condition: if we are trying to close a specific session (checkId)
            // but the active session is already different (prev.id !== checkId), 
            // then we should NOT clear the current session.
            if (checkId && prev?.id !== checkId) {
                return prev;
            }

            // Broadcast End
            const channel = new BroadcastChannel('study_sync_channel');
            channel.postMessage({ type: 'FOCUS_UPDATE', payload: null });
            channel.close();

            return null;
        });
    };



    const toggleZenMode = () => {
        if (window.innerWidth < 768) return; // Prevent enabling on mobile

        setZenMode(prev => {
            const newValue = !prev;
            localStorage.setItem('zen_mode', JSON.stringify(newValue));

            // Broadcast Zen Mode
            const channel = new BroadcastChannel('study_sync_channel');
            channel.postMessage({ type: 'ZEN_MODE_UPDATE', payload: newValue });
            channel.close();

            return newValue;
        });
    };

    const startStudySession = (subthemeId: string) => {
        setActiveStudySession(subthemeId);
    };

    const endStudySession = () => {
        setActiveStudySession(null);
    };

    // Sync status listener
    useEffect(() => {
        SyncQueueService.loadQueue();

        // Subscribe to real-time sync status
        const unsubscribe = SyncQueueService.subscribe((status) => {
            setSyncStatus(status);
        });

        // Mock loading finish
        setTimeout(() => setLoading(false), 1000);

        return () => {
            unsubscribe();
        };
    }, []);

    // 🚀 REALTIME SERVICE INITIALIZATION
    // Inicializa/desconecta o serviço de sincronização em tempo real quando o usuário muda
    useEffect(() => {
        if (user) {
            syncLogger.info('[AppProvider] Initializing RealtimeService for user:', user.id);
            RealtimeService.initialize(user.id);
        } else {
            syncLogger.info('[AppProvider] User logged out, disconnecting RealtimeService');
            RealtimeService.disconnect();
        }

        return () => {
            // Cleanup on unmount
            if (!user) {
                RealtimeService.disconnect();
            }
        };
    }, [user]);

    return (
        <AppContext.Provider value={{
            activeFocus,
            loading,
            syncStatus,
            startFocus,
            endFocus,
            zenMode,
            toggleZenMode,
            unlockedSubthemes,
            activeStudySession,
            startStudySession,
            endStudySession
        }}>
            {children}
        </AppContext.Provider>
    );
};

// export const useAppContext = () => {
//     const context = useContext(AppContext);
//     if (!context) throw new Error('useAppContext must be used within AppProvider');
//     return context;
// };
