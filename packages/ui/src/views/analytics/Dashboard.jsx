import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Grid,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Tabs,
    Tab,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import DateRangeIcon from '@mui/icons-material/DateRange'
import SecurityIcon from '@mui/icons-material/Security'
import GroupIcon from '@mui/icons-material/Group'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import AssessmentIcon from '@mui/icons-material/Assessment'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

// Import components
import DateRangePicker from './components/DateRangePicker'
import MetricsCard from './components/MetricsCard'
import AnalyticsChart from './components/AnalyticsChart'

// Import API services
import { getAccessAnalytics, getPermissionAnalytics, getComplianceAnalytics, getSecurityAnalytics } from '../../api/analytics'

/**
 * Analytics Dashboard
 * Main dashboard for analytics and reporting
 */
const Dashboard = () => {
    const theme = useTheme()
    
    // State for active tab
    const [activeTab, setActiveTab] = useState(0)
    
    // State for date range
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
        granularity: 'daily'
    })
    
    // State for date range picker
    const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false)
    
    // State for filter menu
    const [filterAnchorEl, setFilterAnchorEl] = useState(null)
    
    // State for organization filter
    const [selectedOrganization, setSelectedOrganization] = useState('all')
    
    // State for workspace filter
    const [selectedWorkspace, setSelectedWorkspace] = useState('all')
    
    // State for loading
    const [loading, setLoading] = useState(true)
    
    // State for analytics data
    const [analyticsData, setAnalyticsData] = useState({
        access: null,
        permissions: null,
        compliance: null,
        security: null
    })
    
    // Fetch analytics data
    const fetchAnalyticsData = async () => {
        setLoading(true)
        
        try {
            // Prepare filter params
            const params = {
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
                granularity: dateRange.granularity
            }
            
            if (selectedOrganization !== 'all') {
                params.organizationId = selectedOrganization
            }
            
            if (selectedWorkspace !== 'all') {
                params.workspaceId = selectedWorkspace
            }
            
            // Fetch data based on active tab
            let accessData = null
            let permissionsData = null
            let complianceData = null
            let securityData = null
            
            switch (activeTab) {
                case 0: // Overview
                    // Fetch all data for overview
                    [accessData, permissionsData, complianceData, securityData] = await Promise.all([
                        getAccessAnalytics(params),
                        getPermissionAnalytics(params),
                        getComplianceAnalytics(params),
                        getSecurityAnalytics(params)
                    ])
                    break
                case 1: // Access Patterns
                    accessData = await getAccessAnalytics(params)
                    break
                case 2: // Permission Usage
                    permissionsData = await getPermissionAnalytics(params)
                    break
                case 3: // Compliance
                    complianceData = await getComplianceAnalytics(params)
                    break
                case 4: // Security
                    securityData = await getSecurityAnalytics(params)
                    break
                default:
                    break
            }
            
            setAnalyticsData({
                access: accessData,
                permissions: permissionsData,
                compliance: complianceData,
                security: securityData
            })
        } catch (error) {
            console.error('Error fetching analytics data:', error)
        } finally {
            setLoading(false)
        }
    }
    
    // Fetch data on initial load and when filters change
    useEffect(() => {
        fetchAnalyticsData()
    }, [activeTab, dateRange, selectedOrganization, selectedWorkspace])
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }
    
    // Handle date range change
    const handleDateRangeChange = (newDateRange) => {
        setDateRange(newDateRange)
        setDateRangePickerOpen(false)
    }
    
    // Handle filter menu open
    const handleFilterMenuOpen = (event) => {
        setFilterAnchorEl(event.currentTarget)
    }
    
    // Handle filter menu close
    const handleFilterMenuClose = () => {
        setFilterAnchorEl(null)
    }
    
    // Handle organization change
    const handleOrganizationChange = (organizationId) => {
        setSelectedOrganization(organizationId)
        setSelectedWorkspace('all') // Reset workspace when organization changes
        handleFilterMenuClose()
    }
    
    // Handle workspace change
    const handleWorkspaceChange = (workspaceId) => {
        setSelectedWorkspace(workspaceId)
        handleFilterMenuClose()
    }
    
    // Handle refresh
    const handleRefresh = () => {
        fetchAnalyticsData()
    }
    
    // Handle export
    const handleExport = () => {
        // Implement export functionality
        console.log('Export analytics data')
    }
    
    // Render overview tab content
    const renderOverviewTab = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            )
        }
        
        const { access, permissions, compliance, security } = analyticsData
        
        if (!access || !permissions || !compliance || !security) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            )
        }
        
        return (
            <Grid container spacing={3}>
                {/* Top metrics */}
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Total Access Requests"
                        value={access.summary.totalAccessCount}
                        previousValue={access.summary.previousTotalAccessCount}
                        icon={AssessmentIcon}
                        color="primary"
                        info="Total number of access requests in the selected time period"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Permission Usage"
                        value={permissions.summary.overallUtilizationPercentage}
                        unit="%"
                        previousValue={permissions.summary.previousUtilizationPercentage}
                        icon={VpnKeyIcon}
                        color="secondary"
                        info="Percentage of permissions that are actively being used"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Compliance Score"
                        value={compliance.summary.overallComplianceScore}
                        unit="%"
                        previousValue={compliance.summary.previousComplianceScore}
                        icon={VerifiedUserIcon}
                        color="success"
                        info="Overall compliance score based on access reviews, policy violations, and SOC2 compliance"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Security Alerts"
                        value={security.summary.totalAlerts}
                        previousValue={security.summary.previousTotalAlerts}
                        icon={SecurityIcon}
                        color="error"
                        info="Total number of security alerts in the selected time period"
                    />
                </Grid>
                
                {/* Access patterns chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Access Patterns"
                        subtitle="User access over time"
                        type="area"
                        data={access.accessTrends}
                        xAxisKey="timestamp"
                        series={[
                            { dataKey: 'value', name: 'Access Count' }
                        ]}
                        info="Shows the number of access requests over time"
                    />
                </Grid>
                
                {/* Permission usage chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Permission Usage"
                        subtitle="Most used permissions"
                        type="bar"
                        data={permissions.mostUsedPermissions.slice(0, 5)}
                        xAxisKey="permission"
                        series={[
                            { dataKey: 'usageCount', name: 'Usage Count' }
                        ]}
                        info="Shows the most frequently used permissions"
                    />
                </Grid>
                
                {/* Compliance status chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Compliance Status"
                        subtitle="SOC2 compliance by category"
                        type="pie"
                        data={compliance.soc2Compliance.categories}
                        xAxisKey="category"
                        yAxisKey="complianceRate"
                        info="Shows compliance rate by SOC2 category"
                    />
                </Grid>
                
                {/* Security alerts chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Security Alerts"
                        subtitle="Alerts by severity"
                        type="pie"
                        data={security.alertsBySeverity}
                        xAxisKey="severity"
                        yAxisKey="count"
                        info="Shows security alerts grouped by severity"
                    />
                </Grid>
            </Grid>
        )
    }
    
    // Render access patterns tab content
    const renderAccessPatternsTab = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            )
        }
        
        const { access } = analyticsData
        
        if (!access) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            )
        }
        
        return (
            <Grid container spacing={3}>
                {/* Top metrics */}
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Total Access Requests"
                        value={access.summary.totalAccessCount}
                        previousValue={access.summary.previousTotalAccessCount}
                        icon={AssessmentIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Avg. Daily Access"
                        value={access.summary.avgDailyAccessCount}
                        previousValue={access.summary.previousAvgDailyAccessCount}
                        icon={AssessmentIcon}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Unique Users"
                        value={access.summary.uniqueUsers}
                        previousValue={access.summary.previousUniqueUsers}
                        icon={GroupIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Read/Write Ratio"
                        value={access.summary.readWriteRatio}
                        previousValue={access.summary.previousReadWriteRatio}
                        icon={AssessmentIcon}
                        color="warning"
                    />
                </Grid>
                
                {/* Access trends chart */}
                <Grid item xs={12}>
                    <AnalyticsChart
                        title="Access Trends"
                        subtitle="User access over time"
                        type="area"
                        data={access.accessTrends}
                        xAxisKey="timestamp"
                        series={[
                            { dataKey: 'value', name: 'Access Count' }
                        ]}
                        info="Shows the number of access requests over time"
                    />
                </Grid>
                
                {/* Top resources chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Top Resources"
                        subtitle="Most accessed resources"
                        type="bar"
                        data={access.topResources}
                        xAxisKey="resourceType"
                        series={[
                            { dataKey: 'accessCount', name: 'Access Count' }
                        ]}
                        info="Shows the most frequently accessed resources"
                    />
                </Grid>
                
                {/* Top users chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Top Users"
                        subtitle="Most active users"
                        type="bar"
                        data={access.topUsers}
                        xAxisKey="userName"
                        series={[
                            { dataKey: 'accessCount', name: 'Access Count' }
                        ]}
                        info="Shows the most active users"
                    />
                </Grid>
            </Grid>
        )
    }
    
    // Render permission usage tab content
    const renderPermissionUsageTab = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            )
        }
        
        const { permissions } = analyticsData
        
        if (!permissions) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            )
        }
        
        return (
            <Grid container spacing={3}>
                {/* Top metrics */}
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Permission Usage"
                        value={permissions.summary.overallUtilizationPercentage}
                        unit="%"
                        previousValue={permissions.summary.previousUtilizationPercentage}
                        icon={VpnKeyIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Unused Permissions"
                        value={permissions.summary.unusedPermissionsCount}
                        previousValue={permissions.summary.previousUnusedPermissionsCount}
                        icon={VpnKeyIcon}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Success Rate"
                        value={permissions.summary.successRate}
                        unit="%"
                        previousValue={permissions.summary.previousSuccessRate}
                        icon={VpnKeyIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Avg. Daily Usage"
                        value={permissions.summary.avgDailyUsage}
                        previousValue={permissions.summary.previousAvgDailyUsage}
                        icon={VpnKeyIcon}
                        color="secondary"
                    />
                </Grid>
                
                {/* Permission usage trends chart */}
                <Grid item xs={12}>
                    <AnalyticsChart
                        title="Permission Usage Trends"
                        subtitle="Permission checks over time"
                        type="area"
                        data={permissions.permissionUsageTrends}
                        xAxisKey="timestamp"
                        series={[
                            { dataKey: 'value', name: 'Permission Checks' }
                        ]}
                        info="Shows the number of permission checks over time"
                    />
                </Grid>
                
                {/* Most used permissions chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Most Used Permissions"
                        subtitle="Top permissions by usage"
                        type="bar"
                        data={permissions.mostUsedPermissions}
                        xAxisKey="permission"
                        series={[
                            { dataKey: 'usageCount', name: 'Usage Count' }
                        ]}
                        info="Shows the most frequently used permissions"
                    />
                </Grid>
                
                {/* Permission success rate chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Permission Success Rate"
                        subtitle="Success vs. denied permission checks"
                        type="pie"
                        data={[
                            { name: 'Success', value: permissions.summary.totalSuccessCount },
                            { name: 'Denied', value: permissions.summary.totalDeniedCount }
                        ]}
                        xAxisKey="name"
                        yAxisKey="value"
                        info="Shows the ratio of successful to denied permission checks"
                    />
                </Grid>
            </Grid>
        )
    }
    
    // Render compliance tab content
    const renderComplianceTab = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            )
        }
        
        const { compliance } = analyticsData
        
        if (!compliance) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            )
        }
        
        return (
            <Grid container spacing={3}>
                {/* Top metrics */}
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Compliance Score"
                        value={compliance.summary.overallComplianceScore}
                        unit="%"
                        previousValue={compliance.summary.previousComplianceScore}
                        icon={VerifiedUserIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Pending Reviews"
                        value={compliance.accessReviewStatus.metrics.pendingReviews}
                        previousValue={compliance.accessReviewStatus.metrics.previousPendingReviews}
                        icon={AssessmentIcon}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Policy Violations"
                        value={compliance.policyViolations.metrics.totalViolations}
                        previousValue={compliance.policyViolations.metrics.previousTotalViolations}
                        icon={SecurityIcon}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="SOC2 Compliance"
                        value={compliance.soc2Compliance.metrics.overallComplianceScore}
                        unit="%"
                        previousValue={compliance.soc2Compliance.metrics.previousComplianceScore}
                        icon={VerifiedUserIcon}
                        color="success"
                    />
                </Grid>
                
                {/* SOC2 compliance chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="SOC2 Compliance"
                        subtitle="Compliance by category"
                        type="bar"
                        data={compliance.soc2Compliance.categories}
                        xAxisKey="category"
                        series={[
                            { dataKey: 'complianceRate', name: 'Compliance Rate (%)' }
                        ]}
                        info="Shows compliance rate by SOC2 category"
                    />
                </Grid>
                
                {/* Access review status chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Access Review Status"
                        subtitle="Review completion status"
                        type="pie"
                        data={[
                            { name: 'Completed', value: compliance.accessReviewStatus.metrics.completedReviews },
                            { name: 'Pending', value: compliance.accessReviewStatus.metrics.pendingReviews },
                            { name: 'Overdue', value: compliance.accessReviewStatus.metrics.overdueReviews }
                        ]}
                        xAxisKey="name"
                        yAxisKey="value"
                        info="Shows the status of access reviews"
                    />
                </Grid>
                
                {/* Policy violations chart */}
                <Grid item xs={12}>
                    <AnalyticsChart
                        title="Policy Violations"
                        subtitle="Violations by policy"
                        type="bar"
                        data={compliance.policyViolations.violations}
                        xAxisKey="policyName"
                        series={[
                            { dataKey: 'violationCount', name: 'Violation Count' }
                        ]}
                        info="Shows policy violations grouped by policy"
                    />
                </Grid>
            </Grid>
        )
    }
    
    // Render security tab content
    const renderSecurityTab = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            )
        }
        
        const { security } = analyticsData
        
        if (!security) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            )
        }
        
        return (
            <Grid container spacing={3}>
                {/* Top metrics */}
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Security Alerts"
                        value={security.summary.totalAlerts}
                        previousValue={security.summary.previousTotalAlerts}
                        icon={SecurityIcon}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Critical Alerts"
                        value={security.summary.criticalAlerts}
                        previousValue={security.summary.previousCriticalAlerts}
                        icon={SecurityIcon}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Auth Failures"
                        value={security.summary.authFailures}
                        previousValue={security.summary.previousAuthFailures}
                        icon={SecurityIcon}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricsCard
                        title="Suspicious Activities"
                        value={security.summary.suspiciousActivities}
                        previousValue={security.summary.previousSuspiciousActivities}
                        icon={SecurityIcon}
                        color="secondary"
                    />
                </Grid>
                
                {/* Security alerts trend chart */}
                <Grid item xs={12}>
                    <AnalyticsChart
                        title="Security Alerts Trend"
                        subtitle="Alerts over time"
                        type="area"
                        data={security.alertsTrend}
                        xAxisKey="timestamp"
                        series={[
                            { dataKey: 'value', name: 'Alert Count' }
                        ]}
                        info="Shows the number of security alerts over time"
                    />
                </Grid>
                
                {/* Alerts by severity chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Alerts by Severity"
                        subtitle="Distribution of alerts by severity"
                        type="pie"
                        data={security.alertsBySeverity}
                        xAxisKey="severity"
                        yAxisKey="count"
                        info="Shows security alerts grouped by severity"
                    />
                </Grid>
                
                {/* Alerts by type chart */}
                <Grid item xs={12} md={6}>
                    <AnalyticsChart
                        title="Alerts by Type"
                        subtitle="Distribution of alerts by type"
                        type="bar"
                        data={security.alertsByType}
                        xAxisKey="type"
                        series={[
                            { dataKey: 'count', name: 'Alert Count' }
                        ]}
                        info="Shows security alerts grouped by type"
                    />
                </Grid>
            </Grid>
        )
    }
    
    // Render tab content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return renderOverviewTab()
            case 1:
                return renderAccessPatternsTab()
            case 2:
                return renderPermissionUsageTab()
            case 3:
                return renderComplianceTab()
            case 4:
                return renderSecurityTab()
            default:
                return null
        }
    }
    
    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Analytics & Reporting</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Date range button */}
                    <Button
                        variant="outlined"
                        startIcon={<DateRangeIcon />}
                        onClick={() => setDateRangePickerOpen(true)}
                        sx={{ mr: 1 }}
                    >
                        {`${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
                    </Button>
                    
                    {/* Filter button */}
                    <IconButton onClick={handleFilterMenuOpen} sx={{ mr: 1 }}>
                        <FilterListIcon />
                    </IconButton>
                    
                    {/* Refresh button */}
                    <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
                        <RefreshIcon />
                    </IconButton>
                    
                    {/* Export button */}
                    <IconButton onClick={handleExport}>
                        <DownloadIcon />
                    </IconButton>
                </Box>
            </Box>
            
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
                    <Tab label="Overview" />
                    <Tab label="Access Patterns" />
                    <Tab label="Permission Usage" />
                    <Tab label="Compliance" />
                    <Tab label="Security" />
                </Tabs>
            </Box>
            
            {/* Tab content */}
            {renderTabContent()}
            
            {/* Date range picker */}
            <DateRangePicker
                open={dateRangePickerOpen}
                onClose={() => setDateRangePickerOpen(false)}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
            />
            
            {/* Filter menu */}
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterMenuClose}
            >
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                    Organization
                </Typography>
                <MenuItem
                    selected={selectedOrganization === 'all'}
                    onClick={() => handleOrganizationChange('all')}
                >
                    All Organizations
                </MenuItem>
                <MenuItem
                    selected={selectedOrganization === 'org1'}
                    onClick={() => handleOrganizationChange('org1')}
                >
                    Organization 1
                </MenuItem>
                <MenuItem
                    selected={selectedOrganization === 'org2'}
                    onClick={() => handleOrganizationChange('org2')}
                >
                    Organization 2
                </MenuItem>
                
                <Divider />
                
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                    Workspace
                </Typography>
                <MenuItem
                    selected={selectedWorkspace === 'all'}
                    onClick={() => handleWorkspaceChange('all')}
                >
                    All Workspaces
                </MenuItem>
                <MenuItem
                    selected={selectedWorkspace === 'ws1'}
                    onClick={() => handleWorkspaceChange('ws1')}
                >
                    Workspace 1
                </MenuItem>
                <MenuItem
                    selected={selectedWorkspace === 'ws2'}
                    onClick={() => handleWorkspaceChange('ws2')}
                >
                    Workspace 2
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default Dashboard