import axios from 'axios'
import { baseURL } from '@/store/constant'

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json',
        'x-request-from': 'internal'
    }
})

apiClient.interceptors.request.use(function (config) {
    // Check if we're using Supabase Auth
    if (import.meta.env.VITE_USE_SUPABASE_AUTH === 'true') {
        // Get token from localStorage - Supabase JS client stores it in a key like 'sb-xoqioxysxyadkwmnabgi-auth-token'
        // Try to find any Supabase token
        let supabaseToken = null
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key))
                    if (sessionData?.access_token) {
                        supabaseToken = sessionData.access_token
                        break
                    }
                } catch (e) {
                    console.error('Error parsing Supabase token:', e)
                }
            }
        }
        
        if (supabaseToken) {
            // Set the Authorization header with the Bearer token
            config.headers.Authorization = `Bearer ${supabaseToken}`
            return config
        }
    }
    
    // Fall back to basic auth if Supabase is not enabled or token is not available
    const username = localStorage.getItem('username')
    const password = localStorage.getItem('password')

    if (username && password) {
        config.auth = {
            username,
            password
        }
    }

    return config
})

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear any stored auth data
            localStorage.removeItem('username')
            localStorage.removeItem('password')
            
            // If using Supabase auth, don't redirect here - let the Supabase auth handler take care of it
            if (import.meta.env.VITE_USE_SUPABASE_AUTH !== 'true') {
                // For basic auth, redirect to login page
                window.location.href = '/auth/login'
            }
        }
        
        return Promise.reject(error)
    }
)

export default apiClient
