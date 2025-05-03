import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import ReactApexChart from 'react-apexcharts'
import { Box, Typography } from '@mui/material'

/**
 * Access Pattern Chart Component
 * Displays access patterns over time
 */
const AccessPatternChart = ({ data }) => {
    const theme = useTheme()

    // Format data for chart
    const formattedData = data.map(item => ({
        x: new Date(item.timestamp).getTime(),
        y: item.sum
    }))

    // Chart options
    const chartOptions = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: true
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        grid: {
            strokeDashArray: 0
        },
        xaxis: {
            type: 'datetime',
            categories: data.map(item => item.timestamp),
            labels: {
                formatter: function(value) {
                    return new Date(value).toLocaleDateString()
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
            labels: {
                formatter: function(value) {
                    return Math.round(value)
                }
            }
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            }
        },
        colors: [theme.palette.primary.main],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        legend: {
            show: false
        }
    }

    // Chart series
    const chartSeries = [
        {
            name: 'Access Count',
            data: formattedData
        }
    ]

    return (
        <Box>
            {data.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            ) : (
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="area"
                    height={350}
                />
            )}
        </Box>
    )
}

AccessPatternChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            timestamp: PropTypes.string.isRequired,
            sum: PropTypes.number.isRequired
        })
    ).isRequired
}

export default AccessPatternChart