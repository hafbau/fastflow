import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Typography, Box, Divider } from '@mui/material'
import Chart from 'react-apexcharts'
import { useTheme } from '@mui/material/styles'
import SecurityIcon from '@mui/icons-material/Security'
import WarningIcon from '@mui/icons-material/Warning'

const SecurityAlertsCard = ({ alerts, theme }) => {
    // Group alerts by type
    const alertsByType = {}
    
    alerts.forEach(alert => {
        const metricName = alert.metricName || 'unknown'
        if (!alertsByType[metricName]) {
            alertsByType[metricName] = 0
        }
        alertsByType[metricName] += alert.value || 0
    })
    
    // Prepare data for chart
    const chartData = {
        series: Object.values(alertsByType),
        options: {
            chart: {
                type: 'donut',
                height: 250
            },
            labels: Object.keys(alertsByType).map(key => {
                // Format the metric name for display
                return key.replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
            }),
            colors: [
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.info.main,
                theme.palette.primary.main,
                theme.palette.secondary.main
            ],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 12,
                    height: 12,
                    radius: 6
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Alerts',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return Math.round(val) + '%'
                },
                dropShadow: {
                    enabled: false
                }
            },
            tooltip: {
                theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
                y: {
                    formatter: function (val) {
                        return val
                    }
                }
            }
        }
    }
    
    // Calculate total alerts
    const totalAlerts = Object.values(alertsByType).reduce((sum, count) => sum + count, 0)
    
    // Determine security status
    const getSecurityStatus = () => {
        if (totalAlerts === 0) return { status: 'Secure', color: theme.palette.success.main, icon: SecurityIcon }
        if (totalAlerts < 5) return { status: 'Attention Needed', color: theme.palette.warning.main, icon: WarningIcon }
        return { status: 'Critical', color: theme.palette.error.main, icon: WarningIcon }
    }
    
    const securityStatus = getSecurityStatus()
    const StatusIcon = securityStatus.icon

    return (
        <Card>
            <CardContent>
                <Typography variant="h4" gutterBottom>
                    Security Alerts
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StatusIcon sx={{ color: securityStatus.color, fontSize: 28, mr: 1 }} />
                    <Typography variant="h5" color={securityStatus.color}>
                        {securityStatus.status}
                    </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {totalAlerts === 0 
                        ? 'No security alerts detected in the selected time period.' 
                        : `${totalAlerts} security alerts detected in the selected time period.`
                    }
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {totalAlerts > 0 ? (
                    <Box sx={{ mt: 2 }}>
                        <Chart
                            options={chartData.options}
                            series={chartData.series}
                            type="donut"
                            height={300}
                        />
                        
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Top Security Concerns:
                            </Typography>
                            <ul>
                                {Object.entries(alertsByType)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 3)
                                    .map(([key, value]) => (
                                        <li key={key}>
                                            <Typography variant="body2">
                                                {key.replace(/_/g, ' ')
                                                    .split(' ')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}: {value}
                                            </Typography>
                                        </li>
                                    ))
                                }
                            </ul>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <SecurityIcon sx={{ color: theme.palette.success.main, fontSize: 80, opacity: 0.5 }} />
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

SecurityAlertsCard.propTypes = {
    alerts: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired
}

export default SecurityAlertsCard