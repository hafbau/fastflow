import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import ReactApexChart from 'react-apexcharts'
import { Box, Typography } from '@mui/material'

/**
 * Permission Usage Chart Component
 * Displays permission usage statistics
 */
const PermissionUsageChart = ({ unusedPermissions, mostUsedPermissions }) => {
    const theme = useTheme()

    // Calculate total permissions
    const totalPermissions = unusedPermissions + mostUsedPermissions

    // Calculate percentages
    const unusedPercentage = totalPermissions > 0 ? Math.round((unusedPermissions / totalPermissions) * 100) : 0
    const usedPercentage = 100 - unusedPercentage

    // Chart options
    const chartOptions = {
        chart: {
            type: 'donut',
            height: 350
        },
        labels: ['Used Permissions', 'Unused Permissions'],
        colors: [theme.palette.success.main, theme.palette.error.main],
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
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '16px',
                            fontFamily: theme.typography.fontFamily,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontFamily: theme.typography.fontFamily,
                            formatter: function(val) {
                                return val + '%'
                            }
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '16px',
                            fontFamily: theme.typography.fontFamily,
                            formatter: function() {
                                return totalPermissions
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + '%'
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
                    return val + '%'
                }
            }
        }
    }

    // Chart series
    const chartSeries = [usedPercentage, unusedPercentage]

    return (
        <Box>
            {totalPermissions === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            ) : (
                <Box>
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="donut"
                        height={350}
                    />
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body1">
                            <strong>{usedPercentage}%</strong> of permissions are actively used
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {unusedPermissions} permissions have not been used in the selected time period
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

PermissionUsageChart.propTypes = {
    unusedPermissions: PropTypes.number.isRequired,
    mostUsedPermissions: PropTypes.number.isRequired
}

export default PermissionUsageChart