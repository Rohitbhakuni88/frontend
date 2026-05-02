import axios from 'axios';

// 1. BASE URL CONFIGURATION
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Debugging: This will show up in your F12 console
console.log("Environment API URL:", rawBaseUrl);

// If rawBaseUrl is undefined, this string becomes "undefined/api"
const API_BASE_URL = `${rawBaseUrl}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. THE INTERCEPTOR (JWT Attachment)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Optional: localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;