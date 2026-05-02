import { createContext, useState, useContext } from 'react';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Wrapper
export const AuthProvider = ({ children }) => {
    // Check if we already have a token saved from a previous visit
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const login = (newToken) => {
        localStorage.setItem('token', newToken); // Save to browser storage
        setToken(newToken);                      // Save to React state
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook so any file can easily grab the token
export const useAuth = () => useContext(AuthContext);