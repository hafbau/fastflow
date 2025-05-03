import axios from 'axios'
import { authService } from '../services/AuthService'

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
    try {
        // Get session from Supabase
        const { data: { session } } = await authService.getSupabaseClient().auth.getSession()
        
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`
        }
        
        // Add organization and workspace context if available
        const organizationId = localStorage.getItem('currentOrganizationId')
        const workspaceId = localStorage.getItem('currentWorkspaceId')
        
        if (organizationId) {
            config.headers['X-Organization-Id'] = organizationId
        }
        
        if (workspaceId) {
            config.headers['X-Workspace-Id'] = workspaceId
        }
        
        return config
    } catch (error) {
        console.error('Error adding auth token to request:', error)
        return config
    }
})

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            
            try {
                // Refresh session
                const { data, error: refreshError } = await authService.getSupabaseClient().auth.refreshSession()
                
                if (refreshError) {
                    throw refreshError
                }
                
                if (data.session?.access_token) {
                    // Update the request with the new token
                    originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError)
                
                // Redirect to login if refresh fails
                window.location.href = '/auth/login'
                return Promise.reject(error)
            }
        }
        
        return Promise.reject(error)
    }
)

export default api