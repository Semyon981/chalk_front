import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserByID } from '../api/users';
import { type User } from '../api/types';
import { logout } from '../api/auth';


interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                try {
                    const response = await getUserByID('me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check error:', error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, setUser, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};