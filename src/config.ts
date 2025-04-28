const getApiBaseUrl = () => {
    // If VITE_API_BASE_URL is set, use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Default to localhost in development
    return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl(); 