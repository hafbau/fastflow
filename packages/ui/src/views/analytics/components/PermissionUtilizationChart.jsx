import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Typography, Box } from '@mui/material'
import Chart from 'react-apexcharts'

const PermissionUtilizationChart = ({ data, theme, height = 300 }) => {
    const chartData = {
        series: [
            {
                name: 'Utilization %',
                data: data.map(item => item.avg || 0)
            }
        ],
        options: {
            chart: {
                type: 'line',
                height: height,
                toolbar: {
                    show: true
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            colors: [theme.palette.success.main],
            xaxis: {
                categories: data.map(item => {
                    const date = new Date(item.timestamp)
                    return date.toLocaleDateString()
                }),
                labels: {
                    style: {
                        colors: theme.palette.text.secondary
                    }
                },
                axisBorder: {
                    show: true,
                    color: theme.palette.divider
                },
                axisTicks: {
                    show: true,
                    color: theme.palette.divider
                }
            },
            yaxis: {
                min: 0,
                max: 100,
                labels: {
                    style: {
                        colors: theme.palette.text.secondary
                    },
                    formatter: (value) => `${Math.round(value)}%`
                }
            },
            grid: {
                borderColor: theme.palette.divider
            },
            tooltip: {
                theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
                y: {
                    formatter: (value) => `${Math.round(value)}%`
                },
                x: {
                    format: 'dd MMM yyyy'
                }
            },
            markers: {
                size: 5,
                colors: [theme.palette.success.main],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                    size: 7
                }
            },
            annotations: {
                yaxis: [
                    {
                        y: 50,
                        borderColor: theme.palette.warning.main,
                        borderWidth: 1,
                        strokeDashArray: 5,
                        label: {
                            text: 'Target Utilization',
                            position: 'left',
                            borderColor: theme.palette.warning.main,
                            style: {
                                color: theme.palette.text.primary,
                                background: theme.palette.warning.light
                            }
                        }
                    }
                ]
            }
        }
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h4" gutterBottom>
                    Permission Utilization
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Percentage of assigned permissions being used
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Chart
                        options={chartData.options}
                        series={chartData.series}
                        type="line"
                        height={height}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}

PermissionUtilizationChart.propTypes = {
    data: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired,
    height: PropTypes.number
}

export default PermissionUtilizationChart