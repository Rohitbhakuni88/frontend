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

/// ==========================================
// 3. THE RESPONSE INTERCEPTOR (Secure Session Management)
// ==========================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ONLY log out on 401 (Unauthorized / Token Expired)
        if (error.response && error.response.status === 401) {
            console.warn("Session invalid or expired. Logging out...");
            
            // Clear the invalid token and role
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            
            // Redirect to login ONLY if they aren't already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // If it is 403 (Forbidden), DO NOT log them out.
        // Just let the specific component handle the "Access Denied" error.
        if (error.response && error.response.status === 403) {
            console.warn("403 Forbidden: You do not have the required Role to access this data.");
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
 * TEAM MANAGEMENT ENDPOINTS (Admin Only)
 */

// Add a user to a specific project
export const addMemberToProject = async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/members/${userId}`);
    return response.data;
};

// Remove a user from a specific project
export const removeMemberFromProject = async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
};
// --- USER MANAGEMENT ENDPOINTS ---

// Fetch all users (Admin Only)
export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

/**
 * AUTHENTICATION ENDPOINTS 
 */

// Login user
export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; 
};

// Register user
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};