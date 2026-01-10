import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';
import { SyncQueueService } from '../services/SyncQueueService';
import { AuthContext, type User } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem('app_user');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            logger.error("Failed to parse app_user", e);
            return null;
        }
    });

    // Local-First: If we have a stored user, we're not "loading" the initial UI block
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        if (user) {
            localStorage.setItem('app_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('app_user');
        }
    }, [user]);

    useEffect(() => {
        // Offline Check: If no internet, trust local storage completely and skip Supabase
        if (!navigator.onLine) {
            logger.info("Offline detected on mount. Using cached session.");
            setLoading(false);
            // Optionally set up a one-time listener to re-verify when online?
            // For now, simple robustness is priority.
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Only fetch if not already set locally to avoid flickering
                if (!user) fetchProfile(session.user.id, session.user.email);
            } else {
                setLoading(false);
            }
        }).catch(err => {
            logger.error("Session check failed", err);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email);
            } else {
                if (_event === 'SIGNED_OUT') {
                    setUser(null);
                }
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string, email?: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId) // Reverted: user_id does not exist
                .maybeSingle();

            if (error) {
                logger.error('Error fetching profile:', error);
                // Continue anyway, it will fall back to the auth user data
            }

            if (data) {
                const newUser = {
                    id: data.id,
                    name: data.name || email?.split('@')[0] || 'User',
                    email: data.email,
                    avatar: data.avatar_url,
                };

                // Only update if something actually changed to prevent cascading re-renders
                if (JSON.stringify(newUser) !== JSON.stringify(user)) {
                    setUser(newUser);
                }
            } else {
                const fallbackUser = {
                    id: userId,
                    name: email?.split('@')[0] || 'User',
                    email: email || 'user@local'
                };

                if (JSON.stringify(fallbackUser) !== JSON.stringify(user)) {
                    setUser(fallbackUser);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
            // Optimistic Update
            const optimisticUser: User = {
                id: data.user.id,
                name: email.split('@')[0], // Temporary until profile fetch
                email: data.user.email || email
            };
            setUser(optimisticUser); // Immediate unlock

            // Then fetch real profile
            fetchProfile(data.user.id, data.user.email);
        }
        return { error };
    };

    const registerWithEmail = async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (!error && data.user) {
            // Optimistic Update
            setUser({
                id: data.user.id,
                name: name,
                email: data.user.email || email
            });
        }
        return { error };
    };

    const logout = async () => {
        await supabase.auth.signOut();

        // Clear Application State & Cache
        SyncQueueService.clearQueue();
        localStorage.removeItem('app_user');

        // Clear Study Data Backups
        localStorage.removeItem('study_themes_backup');
        localStorage.removeItem('study_tasks_backup');
        localStorage.removeItem('study_goals_backup');

        // Clear operational flags
        localStorage.removeItem('deleted_theme_ids');
        localStorage.removeItem('gamification_state');

        setUser(null);
    };

    const enterGuestMode = async () => {
        // Use a valid UUID for guest users instead of a string
        // This prevents Supabase sync errors: "invalid input syntax for type uuid"
        const guestUser: User = {
            id: '00000000-0000-0000-0000-000000000001', // Valid UUID for guest mode
            name: 'Convidado Offline',
            email: 'offline@local',
            avatar: undefined
        };
        setUser(guestUser);
        localStorage.setItem('app_user', JSON.stringify(guestUser));
        return Promise.resolve();
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        return { error };
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithEmail,
            registerWithEmail,
            resetPassword,
            logout,
            enterGuestMode, // Expose
            profile: user ? { display_name: user.name, ...user } : null,
            updateProfile: async (updates: { display_name?: string, avatar_url?: string }) => {
                if (!user) return;
                const dbUpdates: Record<string, string> = {};
                if (updates.display_name) dbUpdates.name = updates.display_name;
                if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;

                const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);

                if (!error) {
                    setUser(prev => prev ? {
                        ...prev,
                        name: updates.display_name || prev.name,
                        avatar: updates.avatar_url || prev.avatar
                    } : null);
                }
            }
        }}>
            {loading ? (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};


