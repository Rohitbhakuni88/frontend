import axios from 'axios';

// ==========================================
// 1. BASE URL CONFIGURATION
// ==========================================

// Provide a fallback for local development if the Vercel env var is missing
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Strip any accidental trailing slashes from the environment variable
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');

// Construct the final URL assuming Spring Boot uses @RequestMapping("/api/...")
const API_BASE_URL = `${cleanBaseUrl}/api`;

console.log("Configured API Base URL:", API_BASE_URL);

// Create the Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ==========================================
// 2. THE REQUEST INTERCEPTOR (JWT Attachment)
// ==========================================
api.interceptors.request.use(
    (config) => {
        // Grab the token from local storage before every request
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================
// 3. THE RESPONSE INTERCEPTOR (Secure Session Management)
// ==========================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized or 403 Forbidden (e.g., token expired or tampered with)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Session invalid or expired. Logging out...");
            
            // Clear the invalid token
            localStorage.removeItem('token');
            
            // Redirect to login ONLY if they aren't already there (prevents infinite loops)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;


// ==========================================
// 4. API SERVICE EXPORTS (Use these in your React components)
// ==========================================

/**
 * PROJECT ENDPOINTS
 */

// Fetch all projects for the dashboard
export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

// Create a new project
export const createProject = async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
};

// Delete a specific project by ID
export const deleteProject = async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
};

/**
 * AUTHENTICATION ENDPOINTS (Examples, adjust paths if yours are different)
 */

// Login user
export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Usually returns { token: "ey..." }
};

// Register user
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};