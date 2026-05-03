import { createContext, useState, useContext } from 'react';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Wrapper
export const AuthProvider = ({ children }) => {
    // Check if we already have data saved from a previous visit
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

    // Update the login function to accept the user details from your Spring Boot backend
    const login = (userData) => {
        // 1. Save to browser storage
        localStorage.setItem('token', userData.token);
        if (userData.role) localStorage.setItem('role', userData.role);
        if (userData.id) localStorage.setItem('userId', userData.id);

        // 2. Save to React state
        setToken(userData.token);
        setRole(userData.role);
        setUserId(userData.id);
    };

    const logout = () => {
        // 1. Clear browser storage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');

        // 2. Clear React state
        setToken(null);
        setRole(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider 
            value={{ 
                token, 
                role, 
                userId, 
                login, 
                logout, 
                isAuthenticated: !!token,
                isAdmin: role === 'ADMIN' // Helpful shortcut for your UI checks!
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook so any file can easily grab the auth state
export const useAuth = () => useContext(AuthContext);