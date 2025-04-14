// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

// You can change these values or store them in a more secure way
const DUMMY_USERNAME = 'admin';
const DUMMY_PASSWORD = 'admin123';

type AuthContextType = {
    isAuthenticated: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => false,
    logout: () => { },
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated on app startup
        const authStatus = sessionStorage.getItem('isAuthenticated');
        setIsAuthenticated(authStatus === 'true');
        setLoading(false);
    }, []);

    const login = (username: string, password: string) => {
        if (username === DUMMY_USERNAME && password === DUMMY_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAuthenticated', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('isAuthenticated');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);