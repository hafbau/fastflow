import axios from 'axios';

const instance = axios.create({
    baseURL: '/',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        // Add auth token or other headers if needed
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle error responses
        return Promise.reject(error);
    }
);

export default instance; 