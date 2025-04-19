// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
        } else {
            setUser(session?.user || null);
            setLoading(false);
        }
    }, [session, status]);

    const login = async (username: string, password: string) => {
        const result = await signIn('credentials', {
            redirect: false,
            username,
            password,
        });

        if (!result?.error) {
            router.refresh(); // Refresh to update session
        }

        return result;
    };

    const logout = async () => {
        await signOut({ redirect: false });
        setUser(null);
        router.push('/auth/signin');
        router.refresh();
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};