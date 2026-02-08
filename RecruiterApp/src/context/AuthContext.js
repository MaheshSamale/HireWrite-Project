import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, logoutToken } from '../../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkLogin = async () => {
        const token = await getToken();
        setIsLoggedIn(!!token);
        setLoading(false);
    };

    useEffect(() => { checkLogin(); }, []);

    const logout = async () => {
        await logoutToken();
        setIsLoggedIn(false); 
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, loading, logout, checkLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);