import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography
} from '@mui/material'
import {
    Person as PersonIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon,
    Security as SecurityIcon,
    Assessment as AssessmentIcon,
    Refresh as RefreshIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Warning as WarningIcon
} from '@mui/icons-material'
import Chart from 'react-apexcharts'
import useApi from '@/hooks/useApi'
import { gridSpacing } from 'store/constant'

const AdminDashboard = () => {
    const theme = useTheme()
    const api = useApi()
    const [loading, setLoading] = useState(false)
    const [dashboardData, setDashboardData] = useState({
        userStats: {
            total: 0,
            active: 0,
            inactive: 0,
            newThisMonth: 0,
            percentChange: 0
        },
        organizationStats: {
            total: 0,
            active: 0,
            newThisMonth: 0,
            percentChange: 0
        },
        workspaceStats: {
            total: 0,
            active: 0,
            newThisMonth: 0,
            percentChange: 0
        },
        securityStats: {
            failedLogins: 0,
            mfaEnabled: 0,
            mfaPercent: 0,
            permissionChanges: 0
        },
        userActivityData: [],
        recentAuditLogs: []
    })

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would be an API call
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample data
            const sampleData = {
                userStats: {
                    total: 125,
                    active: 98,
                    inactive: 27,
                    newThisMonth: 15,
                    percentChange: 12.5
                },
                organizationStats: {
                    total: 18,
                    active: 16,
                    newThisMonth: 3,
                    percentChange: 20
                },
                workspaceStats: {
                    total: 42,
                    active: 38,
                    newThisMonth: 7,
                    percentChange: 16.7
                },
                securityStats: {
                    failedLogins: 23,
                    mfaEnabled: 76,
                    mfaPercent: 60.8,
                    permissionChanges: 12
                },
                userActivityData: [
                    { month: 'Jan', logins: 320, signups: 10 },
                    { month: 'Feb', logins: 340, signups: 12 },
                    { month: 'Mar', logins: 355, signups: 14 },
                    { month: 'Apr', logins: 390, signups: 18 },
                    { month: 'May', logins: 410, signups: 20 },
                    { month: 'Jun', logins: 435, signups: 22 },
                    { month: 'Jul', logins: 470, signups: 25 },
                    { month: 'Aug', logins: 500, signups: 28 },
                    { month: 'Sep', logins: 520, signups: 30 },
                    { month: 'Oct', logins: 540, signups: 32 },
                    { month: 'Nov', logins: 570, signups: 35 },
                    { month: 'Dec', logins: 600, signups: 40 }
                ],
                recentAuditLogs: [
                    {
                        id: '1',
                        action: 'login',
                        user: 'admin@example.com',
                        details: 'Successful login',
                        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                    },
                    {
                        id: '2',
                        action: 'user_create',
                        user: 'admin@example.com',
                        details: 'Created user john.doe@example.com',
                        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
                    },
                    {
                        id: '3',
                        action: 'role_update',
                        user: 'admin@example.com',
                        details: 'Updated role permissions for "Organization Admin"',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '4',
                        action: 'organization_create',
                        user: 'admin@example.com',
                        details: 'Created organization "Stark Industries"',
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '5',
                        action: 'login_failed',
                        user: 'unknown',
                        details: 'Failed login attempt for user alice@example.com',
                        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                    }
                ]
            }
            
            setDashboardData(sampleData)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Format relative time
    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
        
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    }

    // Get icon for action
    const getActionIcon = (action) => {
        switch (action) {
            case 'login':
                return <PersonIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
            case 'login_failed':
                return <WarningIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
            case 'user_create':
                return <PersonIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
            case 'role_update':
                return <SecurityIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
            case 'organization_create':
                return <BusinessIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
            default:
                return <AssessmentIcon fontSize="small" />
        }
    }

    // User activity chart options
    const userActivityChartOptions = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            categories: dashboardData.userActivityData.map(item => item.month)
        },
        yaxis: {
            title: {
                text: 'Count'
            }
        },
        colors: [theme.palette.primary.main, theme.palette.success.main],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100]
            }
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    }

    // User activity chart series
    const userActivityChartSeries = [
        {
            name: 'Logins',
            data: dashboardData.userActivityData.map(item => item.logins)
        },
        {
            name: 'Signups',
            data: dashboardData.userActivityData.map(item => item.signups)
        }
    ]

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData()
    }, [])

    return (
        <Grid container spacing={gridSpacing}>
            {/* Stats Cards */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="h4" color="primary">
                                    {dashboardData.userStats.total}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Total Users
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                bgcolor: theme.palette.primary.light, 
                                p: 1.5, 
                                borderRadius: '50%' 
                            }}>
                                <PersonIcon sx={{ color: theme.palette.primary.main }} />
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                            {dashboardData.userStats.percentChange >= 0 ? (
                                <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                            ) : (
                                <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                            )}
                            <Typography variant="caption" color={dashboardData.userStats.percentChange >= 0 ? 'success.main' : 'error.main'}>
                                {Math.abs(dashboardData.userStats.percentChange)}% from last month
                            </Typography>
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                                Active: {dashboardData.userStats.active}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                New: {dashboardData.userStats.newThisMonth}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="h4" color="secondary">
                                    {dashboardData.organizationStats.total}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Organizations
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                bgcolor: theme.palette.secondary.light, 
                                p: 1.5, 
                                borderRadius: '50%' 
                            }}>
                                <BusinessIcon sx={{ color: theme.palette.secondary.main }} />
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                            {dashboardData.organizationStats.percentChange >= 0 ? (
                                <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                            ) : (
                                <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                            )}
                            <Typography variant="caption" color={dashboardData.organizationStats.percentChange >= 0 ? 'success.main' : 'error.main'}>
                                {Math.abs(dashboardData.organizationStats.percentChange)}% from last month
                            </Typography>
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                                Active: {dashboardData.organizationStats.active}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                New: {dashboardData.organizationStats.newThisMonth}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="h4" color="warning.main">
                                    {dashboardData.workspaceStats.total}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Workspaces
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                bgcolor: theme.palette.warning.light, 
                                p: 1.5, 
                                borderRadius: '50%' 
                            }}>
                                <WorkspacesIcon sx={{ color: theme.palette.warning.main }} />
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                            {dashboardData.workspaceStats.percentChange >= 0 ? (
                                <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                            ) : (
                                <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                            )}
                            <Typography variant="caption" color={dashboardData.workspaceStats.percentChange >= 0 ? 'success.main' : 'error.main'}>
                                {Math.abs(dashboardData.workspaceStats.percentChange)}% from last month
                            </Typography>
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                                Active: {dashboardData.workspaceStats.active}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                New: {dashboardData.workspaceStats.newThisMonth}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="h4" color="error.main">
                                    {dashboardData.securityStats.failedLogins}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Failed Logins
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                bgcolor: theme.palette.error.light, 
                                p: 1.5, 
                                borderRadius: '50%' 
                            }}>
                                <SecurityIcon sx={{ color: theme.palette.error.main }} />
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                            <Typography variant="caption" color="textSecondary">
                                MFA Enabled: {dashboardData.securityStats.mfaEnabled} users ({dashboardData.securityStats.mfaPercent}%)
                            </Typography>
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                                Permission Changes: {dashboardData.securityStats.permissionChanges}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>

            {/* User Activity Chart */}
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4">User Activity</Typography>
                            <IconButton size="small" onClick={fetchDashboardData}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        <Chart
                            options={userActivityChartOptions}
                            series={userActivityChartSeries}
                            type="area"
                            height={350}
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Recent Audit Logs */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4">Recent Activity</Typography>
                            <Button
                                variant="text"
                                color="primary"
                                size="small"
                                href="/admin/audit-logs"
                            >
                                View All
                            </Button>
                        </Stack>
                        <Stack spacing={2}>
                            {dashboardData.recentAuditLogs.map((log) => (
                                <Paper
                                    key={log.id}
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: theme.palette.background.default,
                                        borderRadius: 1
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box>
                                            {getActionIcon(log.action)}
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {log.details}
                                            </Typography>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" color="textSecondary">
                                                    {log.user}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formatRelativeTime(log.timestamp)}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default AdminDashboard