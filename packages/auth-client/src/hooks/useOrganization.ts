import { useState, useEffect } from 'react'
import api from '../utils/api'

export interface Organization {
    id: string
    name: string
    slug: string
    createdAt: Date
    createdBy: string
}

/**
 * Hook to fetch and manage organization data
 * @param organizationId Organization ID
 */
export const useOrganization = (organizationId?: string) => {
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    
    useEffect(() => {
        if (organizationId) {
            fetchOrganization(organizationId)
        } else {
            setOrganization(null)
        }
    }, [organizationId])
    
    const fetchOrganization = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await api.get(`/api/v1/organizations/${id}`)
            setOrganization(response.data)
        } catch (err) {
            console.error('Error fetching organization:', err)
            setError(err instanceof Error ? err : new Error('Failed to fetch organization'))
        } finally {
            setLoading(false)
        }
    }
    
    return {
        organization,
        loading,
        error,
        refetch: organizationId ? () => fetchOrganization(organizationId) : () => {}
    }
}