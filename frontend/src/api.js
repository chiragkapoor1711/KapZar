import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log("API Base URL:", api.defaults.baseURL);
if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is NOT set! Using default: http://127.0.0.1:8000/api/");
}

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
