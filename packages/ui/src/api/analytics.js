import axios from 'axios'
import { API_URL } from '../config'

/**
 * Get access analytics data
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Access analytics data
 */
export const getAccessAnalytics = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/access`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching access analytics:', error)
        throw error
    }
}

/**
 * Get permission analytics data
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Permission analytics data
 */
export const getPermissionAnalytics = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/permissions`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching permission analytics:', error)
        throw error
    }
}

/**
 * Get compliance analytics data
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Compliance analytics data
 */
export const getComplianceAnalytics = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/compliance`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching compliance analytics:', error)
        throw error
    }
}

/**
 * Get security analytics data
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Security analytics data
 */
export const getSecurityAnalytics = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/security`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching security analytics:', error)
        throw error
    }
}

/**
 * Get resource usage analytics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Resource usage analytics
 */
export const getResourceUsage = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/resources/usage`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching resource usage analytics:', error)
        throw error
    }
}

/**
 * Get user activity analytics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} User activity analytics
 */
export const getUserActivity = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/users/activity`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching user activity analytics:', error)
        throw error
    }
}

/**
 * Get user permission utilization
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} User permission utilization
 */
export const getUserPermissionUtilization = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/users/permissions`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching user permission utilization:', error)
        throw error
    }
}

/**
 * Export analytics data
 * @param {string} type - Analytics type (access, permissions, compliance, security)
 * @param {Object} params - Query parameters
 * @returns {Promise<Blob>} Exported data as blob
 */
export const exportAnalyticsData = async (type, params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/${type}/export`, {
            params,
            responseType: 'blob'
        })
        return response.data
    } catch (error) {
        console.error(`Error exporting ${type} analytics data:`, error)
        throw error
    }
}

/**
 * Get analytics metrics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Analytics metrics
 */
export const getAnalyticsMetrics = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/metrics`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching analytics metrics:', error)
        throw error
    }
}

/**
 * Get analytics alerts
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Analytics alerts
 */
export const getAnalyticsAlerts = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/alerts`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching analytics alerts:', error)
        throw error
    }
}

/**
 * Update alert status
 * @param {string} alertId - Alert ID
 * @param {Object} data - Alert update data
 * @returns {Promise<Object>} Updated alert
 */
export const updateAlertStatus = async (alertId, data) => {
    try {
        const response = await axios.put(`${API_URL}/api/analytics/alerts/${alertId}/status`, data)
        return response.data
    } catch (error) {
        console.error('Error updating alert status:', error)
        throw error
    }
}

/**
 * Get analytics report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Analytics report
 */
export const getAnalyticsReport = async (reportId) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/reports/${reportId}`)
        return response.data
    } catch (error) {
        console.error('Error fetching analytics report:', error)
        throw error
    }
}

/**
 * Generate analytics report
 * @param {Object} data - Report configuration
 * @returns {Promise<Object>} Generated report
 */
export const generateAnalyticsReport = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/api/analytics/reports`, data)
        return response.data
    } catch (error) {
        console.error('Error generating analytics report:', error)
        throw error
    }
}

/**
 * Get analytics report list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Analytics report list
 */
export const getAnalyticsReportList = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/analytics/reports`, { params })
        return response.data
    } catch (error) {
        console.error('Error fetching analytics report list:', error)
        throw error
    }
}

/**
 * Delete analytics report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteAnalyticsReport = async (reportId) => {
    try {
        const response = await axios.delete(`${API_URL}/api/analytics/reports/${reportId}`)
        return response.data
    } catch (error) {
        console.error('Error deleting analytics report:', error)
        throw error
    }
}