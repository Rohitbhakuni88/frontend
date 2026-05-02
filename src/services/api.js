import axios from 'axios';

// Create a central Axios instance pointing to your Spring Boot server
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// The "Interceptor": This runs before every single request leaves your browser.
api.interceptors.request.use(
    (config) => {
        // 1. Check local storage for the JWT token
        const token = localStorage.getItem('token');
        
        // 2. If it exists, attach it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;