import { getRepository, Between, In, MoreThan, LessThan, FindOptionsWhere } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuditLog } from '../../database/entities/AuditLog'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import analyticsService from './AnalyticsService'
import logger from '../../utils/logger'
import accessReviewService from '../AccessReviewService'

/**
 * Service for compliance analytics
 */
// Define AccessReview interface at class level
interface AccessReview {
    id: string;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    dueDate: Date;
    reviewerId: string;
    resourceId: string;
    resourceType: string;
}

class ComplianceAnalyticsService {
    /**
     * Get compliance status
     * @param params Query parameters
     * @returns Compliance status
     */
    async getComplianceStatus(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            
            // Get access review status
            const accessReviewStatus = await this.getAccessReviewStatus({
                startTime,
                endTime,
                organizationId,
                workspaceId
            })
            
            // Get policy violations
            const policyViolations = await this.getPolicyViolations({
                startTime,
                endTime,
                organizationId,
                workspaceId
            })
            
            // Get SOC2 compliance
            const soc2Compliance = await this.getSOC2Compliance({
                startTime,
                endTime,
                organizationId,
                workspaceId
            })
            
            // Calculate overall compliance score
            const overallComplianceScore = this.calculateOverallComplianceScore({
                accessReviewStatus,
                policyViolations,
                soc2Compliance
            })
            
            return {
                summary: {
                    overallComplianceScore,
                    pendingAccessReviews: accessReviewStatus.metrics.pendingReviews,
                    criticalPolicyViolations: policyViolations.metrics.criticalViolations,
                    soc2ComplianceScore: soc2Compliance.metrics.overallComplianceScore
                },
                accessReviewStatus,
                policyViolations,
                soc2Compliance
            }
        } catch (error) {
            logger.error(`[ComplianceAnalyticsService] getComplianceStatus error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get compliance status')
        }
    }
    
    /**
     * Get access review status
     * @param params Query parameters
     * @returns Access review status
     */
    private async getAccessReviewStatus(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            
            // Get access review metrics
            let accessReviews = [] as AccessReview[]
            
            try {
                // Mock access review data for now
                // In a real implementation, this would call the actual service
                accessReviews = [
                    {
                        id: '1',
                        status: 'completed',
                        createdAt: new Date(startTime.getTime() + 1000000),
                        completedAt: new Date(startTime.getTime() + 3000000),
                        dueDate: new Date(startTime.getTime() + 5000000),
                        reviewerId: 'user1',
                        resourceId: 'resource1',
                        resourceType: 'role'
                    },
                    {
                        id: '2',
                        status: 'pending',
                        createdAt: new Date(startTime.getTime() + 2000000),
                        completedAt: null,
                        dueDate: new Date(endTime.getTime() + 1000000),
                        reviewerId: 'user2',
                        resourceId: 'resource2',
                        resourceType: 'permission'
                    },
                    {
                        id: '3',
                        status: 'pending',
                        createdAt: new Date(startTime.getTime() + 3000000),
                        completedAt: null,
                        dueDate: new Date(startTime.getTime() - 1000000), // Overdue
                        reviewerId: 'user3',
                        resourceId: 'resource3',
                        resourceType: 'user'
                    }
                ]
            } catch (error) {
                logger.error(`[ComplianceAnalyticsService] Error getting access reviews: ${error}`)
                accessReviews = []
            }
            
            // Calculate metrics
            const totalReviews = accessReviews.length
            const completedReviews = accessReviews.filter((review) => review.status === 'completed').length
            const pendingReviews = accessReviews.filter((review) => review.status === 'pending').length
            const overdueReviews = accessReviews.filter((review) => {
                return review.status === 'pending' && new Date(review.dueDate) < new Date()
            }).length
            
            const completionRate = totalReviews > 0 ? completedReviews / totalReviews : 0
            
            // Calculate average completion time
            let totalCompletionTime = 0
            let completedReviewsWithTime = 0
            
            for (const review of accessReviews) {
                if (review.status === 'completed' && review.completedAt && review.createdAt) {
                    const completionTime = new Date(review.completedAt).getTime() - new Date(review.createdAt).getTime()
                    totalCompletionTime += completionTime
                    completedReviewsWithTime++
                }
            }
            
            const averageCompletionTime = completedReviewsWithTime > 0
                ? Math.round(totalCompletionTime / completedReviewsWithTime / (24 * 60 * 60 * 1000)) // Convert to days
                : 0
            
            // Get recent reviews
            const recentReviews = accessReviews
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
            
            // Calculate metrics
            const metrics = {
                totalReviews,
                completedReviews,
                pendingReviews,
                overdueReviews,
                completionRate,
                averageCompletionTime
            }
            
            return {
                metrics,
                recentReviews
            }
        } catch (error) {
            logger.error(`[ComplianceAnalyticsService] getAccessReviewStatus error: ${error}`)
            return {
                metrics: {
                    totalReviews: 0,
                    completedReviews: 0,
                    pendingReviews: 0,
                    overdueReviews: 0,
                    completionRate: 0,
                    averageCompletionTime: 0
                },
                recentReviews: []
            }
        }
    }
    
    /**
     * Get policy violations
     * @param params Query parameters
     * @returns Policy violations
     */
    private async getPolicyViolations(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Create metadata condition
            const metadata: Record<string, any> = {}
            
            if (organizationId) {
                metadata.organizationId = organizationId
            }
            
            if (workspaceId) {
                metadata.workspaceId = workspaceId
            }
            
            // Get all policy violation logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: 'policy_violation'
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const violationLogs = await auditLogRepository.find({
                where: whereConditions,
                order: {
                    timestamp: 'DESC'
                }
            })
            
            // Group by policy
            const policyViolationMap = new Map<string, {
                policyId: string
                policyName: string
                violationCount: number
                severity: string
                lastViolation: Date
                uniqueUsers: Set<string>
            }>()
            
            for (const log of violationLogs) {
                if (!log.metadata?.policyId || !log.metadata?.policyName) continue
                
                const policyId = log.metadata.policyId
                
                if (!policyViolationMap.has(policyId)) {
                    policyViolationMap.set(policyId, {
                        policyId,
                        policyName: log.metadata.policyName,
                        violationCount: 0,
                        severity: log.metadata.severity || 'medium',
                        lastViolation: log.timestamp,
                        uniqueUsers: new Set()
                    })
                }
                
                const policyViolation = policyViolationMap.get(policyId)!
                policyViolation.violationCount++
                
                if (log.userId) {
                    policyViolation.uniqueUsers.add(log.userId)
                }
                
                if (log.timestamp > policyViolation.lastViolation) {
                    policyViolation.lastViolation = log.timestamp
                }
            }
            
            // Convert to array and sort by violation count
            const policyViolations = Array.from(policyViolationMap.values())
                .map(violation => ({
                    ...violation,
                    uniqueUsers: violation.uniqueUsers.size
                }))
                .sort((a, b) => b.violationCount - a.violationCount)
            
            // Calculate metrics
            const totalViolations = violationLogs.length
            const criticalViolations = policyViolations
                .filter(violation => violation.severity === 'critical')
                .reduce((sum, violation) => sum + violation.violationCount, 0)
            const highViolations = policyViolations
                .filter(violation => violation.severity === 'high')
                .reduce((sum, violation) => sum + violation.violationCount, 0)
            
            const metrics = {
                totalViolations,
                criticalViolations,
                highViolations,
                uniquePolicies: policyViolations.length
            }
            
            return {
                metrics,
                violations: policyViolations,
                recentViolations: violationLogs.slice(0, 10)
            }
        } catch (error) {
            logger.error(`[ComplianceAnalyticsService] getPolicyViolations error: ${error}`)
            return {
                metrics: {
                    totalViolations: 0,
                    criticalViolations: 0,
                    highViolations: 0,
                    uniquePolicies: 0
                },
                violations: [],
                recentViolations: []
            }
        }
    }
    
    /**
     * Get SOC2 compliance
     * @param params Query parameters
     * @returns SOC2 compliance
     */
    private async getSOC2Compliance(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            
            // This would typically involve checking various compliance criteria
            // For this implementation, we'll use a simplified approach
            
            // Get compliance metrics from analytics service
            const complianceMetrics = await analyticsService.getMetrics({
                startTime,
                endTime,
                metricType: MetricType.COMPLIANCE,
                metricName: 'soc2_compliance',
                organizationId,
                workspaceId
            })
            
            // Define SOC2 criteria
            const soc2Criteria = [
                { id: 'CC1.1', name: 'Control Environment', category: 'Common Criteria' },
                { id: 'CC2.1', name: 'Communication and Information', category: 'Common Criteria' },
                { id: 'CC3.1', name: 'Risk Assessment', category: 'Common Criteria' },
                { id: 'CC4.1', name: 'Monitoring Activities', category: 'Common Criteria' },
                { id: 'CC5.1', name: 'Control Activities', category: 'Common Criteria' },
                { id: 'CC6.1', name: 'Logical and Physical Access Controls', category: 'Common Criteria' },
                { id: 'CC7.1', name: 'System Operations', category: 'Common Criteria' },
                { id: 'CC8.1', name: 'Change Management', category: 'Common Criteria' },
                { id: 'CC9.1', name: 'Risk Mitigation', category: 'Common Criteria' },
                { id: 'A1.1', name: 'Availability', category: 'Additional Criteria' },
                { id: 'C1.1', name: 'Confidentiality', category: 'Additional Criteria' },
                { id: 'P1.1', name: 'Privacy', category: 'Additional Criteria' }
            ]
            
            // Map metrics to criteria
            const criteriaMap = new Map<string, {
                id: string
                name: string
                category: string
                compliant: boolean
                lastChecked: Date | null
                details: string | null
            }>()
            
            // Initialize all criteria as non-compliant
            for (const criteria of soc2Criteria) {
                criteriaMap.set(criteria.id, {
                    ...criteria,
                    compliant: false,
                    lastChecked: null,
                    details: null
                })
            }
            
            // Update criteria based on metrics
            for (const metric of complianceMetrics) {
                if (metric.dimensions?.criteriaId && criteriaMap.has(metric.dimensions.criteriaId)) {
                    const criteria = criteriaMap.get(metric.dimensions.criteriaId)!
                    criteria.compliant = metric.value >= 1
                    criteria.lastChecked = metric.timestamp
                    criteria.details = metric.dimensions.details || null
                }
            }
            
            // Convert to array
            const criteria = Array.from(criteriaMap.values())
            
            // Group by category
            const categoriesMap = new Map<string, {
                category: string
                criteria: any[]
                compliantCount: number
                totalCount: number
            }>()
            
            for (const criterion of criteria) {
                if (!categoriesMap.has(criterion.category)) {
                    categoriesMap.set(criterion.category, {
                        category: criterion.category,
                        criteria: [],
                        compliantCount: 0,
                        totalCount: 0
                    })
                }
                
                const category = categoriesMap.get(criterion.category)!
                category.criteria.push(criterion)
                category.totalCount++
                
                if (criterion.compliant) {
                    category.compliantCount++
                }
            }
            
            // Convert to array
            const categories = Array.from(categoriesMap.values())
                .map(category => ({
                    ...category,
                    complianceRate: category.totalCount > 0
                        ? Math.round((category.compliantCount / category.totalCount) * 100)
                        : 0
                }))
            
            // Calculate metrics
            const totalCriteria = criteria.length
            const compliantCriteria = criteria.filter(c => c.compliant).length
            const nonCompliantCriteria = totalCriteria - compliantCriteria
            const overallComplianceScore = totalCriteria > 0
                ? Math.round((compliantCriteria / totalCriteria) * 100)
                : 0
            
            const metrics = {
                totalCriteria,
                compliantCriteria,
                nonCompliantCriteria,
                overallComplianceScore
            }
            
            return {
                metrics,
                categories,
                criteria
            }
        } catch (error) {
            logger.error(`[ComplianceAnalyticsService] getSOC2Compliance error: ${error}`)
            return {
                metrics: {
                    totalCriteria: 0,
                    compliantCriteria: 0,
                    nonCompliantCriteria: 0,
                    overallComplianceScore: 0
                },
                categories: [],
                criteria: []
            }
        }
    }
    
    /**
     * Calculate overall compliance score
     * @param params Compliance components
     * @returns Overall compliance score
     */
    private calculateOverallComplianceScore(params: {
        accessReviewStatus: any
        policyViolations: any
        soc2Compliance: any
    }): number {
        try {
            const { accessReviewStatus, policyViolations, soc2Compliance } = params
            
            // Calculate access review score (30% weight)
            const accessReviewScore = accessReviewStatus.metrics.completionRate * 100
            
            // Calculate policy violation score (30% weight)
            // Higher violations = lower score
            const policyViolationScore = policyViolations.metrics.totalViolations > 0
                ? Math.max(0, 100 - (policyViolations.metrics.criticalViolations * 10) - (policyViolations.metrics.highViolations * 5))
                : 100
            
            // SOC2 compliance score (40% weight)
            const soc2Score = soc2Compliance.metrics.overallComplianceScore
            
            // Calculate weighted average
            const overallScore = (accessReviewScore * 0.3) + (policyViolationScore * 0.3) + (soc2Score * 0.4)
            
            return Math.round(overallScore)
        } catch (error) {
            logger.error(`[ComplianceAnalyticsService] calculateOverallComplianceScore error: ${error}`)
            return 0
        }
    }
}

export default new ComplianceAnalyticsService()