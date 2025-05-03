import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import ReactApexChart from 'react-apexcharts'
import { Box, Typography, Grid, Paper } from '@mui/material'

/**
 * Security Analytics Chart Component
 * Displays security analytics metrics
 */
const SecurityAnalyticsChart = ({ authFailures, permissionDenials, suspiciousActivities }) => {
    const theme = useTheme()

    // Calculate total security issues
    const totalIssues = authFailures + permissionDenials + suspiciousActivities

    // Chart options for pie chart
    const pieChartOptions = {
        chart: {
            type: 'pie',
            height: 350
        },
        labels: ['Authentication Failures', 'Permission Denials', 'Suspicious Activities'],
        colors: [theme.palette.warning.main, theme.palette.info.main, theme.palette.error.main],
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: theme.typography.fontFamily,
            offsetY: 10
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    offset: -10
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val, opts) {
                return opts.w.config.series[opts.seriesIndex]
            },
            style: {
                fontSize: '14px',
                fontFamily: theme.typography.fontFamily,
                fontWeight: 'normal'
            },
            dropShadow: {
                enabled: false
            }
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function(val) {
                    return val
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    }

    // Chart series for pie chart
    const pieChartSeries = [authFailures, permissionDenials, suspiciousActivities]

    // Chart options for bar chart
    const barChartOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: ['Authentication Failures', 'Permission Denials', 'Suspicious Activities'],
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: theme.typography.fontFamily
                }
            }
        },
        yaxis: {
            title: {
                text: 'Count',
                style: {
                    fontSize: '14px',
                    fontFamily: theme.typography.fontFamily
                }
            },
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: theme.typography.fontFamily
                }
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val
                }
            }
        },
        colors: [theme.palette.warning.main, theme.palette.info.main, theme.palette.error.main]
    }

    // Chart series for bar chart
    const barChartSeries = [
        {
            name: 'Authentication Failures',
            data: [authFailures, 0, 0]
        },
        {
            name: 'Permission Denials',
            data: [0, permissionDenials, 0]
        },
        {
            name: 'Suspicious Activities',
            data: [0, 0, suspiciousActivities]
        }
    ]

    // Security score calculation (simple example)
    // Lower score means more security issues
    const calculateSecurityScore = () => {
        // Base score is 100
        let score = 100
        
        // Deduct points for each type of issue
        // Suspicious activities have the highest weight
        score -= authFailures * 1
        score -= permissionDenials * 2
        score -= suspiciousActivities * 5
        
        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, score))
    }

    const securityScore = calculateSecurityScore()

    // Get color based on score
    const getScoreColor = (score) => {
        if (score >= 80) return theme.palette.success.main
        if (score >= 60) return theme.palette.warning.main
        return theme.palette.error.main
    }

    const scoreColor = getScoreColor(securityScore)

    return (
        <Box>
            {totalIssues === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1">No security issues detected</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <ReactApexChart
                            options={pieChartOptions}
                            series={pieChartSeries}
                            type="pie"
                            height={350}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper 
                                elevation={3} 
                                sx={{ 
                                    p: 2, 
                                    mb: 2, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.background.default
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Security Score
                                </Typography>
                                <Typography 
                                    variant="h2" 
                                    sx={{ 
                                        color: scoreColor,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {securityScore}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {securityScore >= 80 ? 'Good' : securityScore >= 60 ? 'Needs Attention' : 'Critical'}
                                </Typography>
                            </Paper>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Security Issues Breakdown
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Authentication Failures:</strong> {authFailures}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Permission Denials:</strong> {permissionDenials}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Suspicious Activities:</strong> {suspiciousActivities}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Total Issues:</strong> {totalIssues}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </Box>
    )
}

SecurityAnalyticsChart.propTypes = {
    authFailures: PropTypes.number.isRequired,
    permissionDenials: PropTypes.number.isRequired,
    suspiciousActivities: PropTypes.number.isRequired
}

export default SecurityAnalyticsChart