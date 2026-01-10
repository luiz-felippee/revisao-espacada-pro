import { createContext, useContext } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
    registerWithEmail: (name: string, email: string, password: string) => Promise<{ error: { message: string } | null }>;
    resetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
    logout: () => Promise<void>;
    profile: (User & { [key: string]: unknown }) | null;
    updateProfile: (updates: { display_name?: string, avatar_url?: string }) => Promise<void>;
    enterGuestMode: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
