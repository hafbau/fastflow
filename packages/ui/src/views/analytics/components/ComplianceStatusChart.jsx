import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import ReactApexChart from 'react-apexcharts'
import { Box, Typography, Grid } from '@mui/material'

/**
 * Compliance Status Chart Component
 * Displays compliance status metrics
 */
const ComplianceStatusChart = ({ accessReviewScore, policyViolationScore, soc2Score }) => {
    const theme = useTheme()

    // Ensure scores are within 0-100 range
    const normalizedAccessReviewScore = Math.min(Math.max(accessReviewScore, 0), 100)
    const normalizedPolicyViolationScore = Math.min(Math.max(policyViolationScore, 0), 100)
    const normalizedSoc2Score = Math.min(Math.max(soc2Score, 0), 100)

    // Calculate overall compliance score
    const overallScore = Math.round((normalizedAccessReviewScore + normalizedPolicyViolationScore + normalizedSoc2Score) / 3)

    // Get color based on score
    const getScoreColor = (score) => {
        if (score >= 80) return theme.palette.success.main
        if (score >= 60) return theme.palette.warning.main
        return theme.palette.error.main
    }

    // Chart options
    const chartOptions = {
        chart: {
            type: 'radialBar',
            height: 350,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: theme.palette.background.paper,
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front'
                },
                track: {
                    background: theme.palette.grey[200],
                    strokeWidth: '67%',
                    margin: 0
                },
                dataLabels: {
                    show: true,
                    name: {
                        show: false
                    },
                    value: {
                        offsetY: -10,
                        color: theme.palette.text.primary,
                        fontSize: '24px',
                        fontWeight: 600,
                        formatter: function(val) {
                            return val + '%'
                        }
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: [getScoreColor(overallScore)],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Overall Compliance']
    }

    // Chart series
    const chartSeries = [overallScore]

    // Bar chart options for individual scores
    const barChartOptions = {
        chart: {
            type: 'bar',
            height: 150,
            toolbar: {
                show: false
            },
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '40%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val + '%'
            },
            style: {
                fontSize: '12px',
                fontFamily: theme.typography.fontFamily,
                fontWeight: 'normal'
            }
        },
        xaxis: {
            categories: ['Access Reviews', 'Policy Compliance', 'SOC2 Compliance'],
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            max: 100
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    fontSize: '12px',
                    fontFamily: theme.typography.fontFamily
                }
            }
        },
        grid: {
            show: false
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function(val) {
                    return val + '%'
                }
            }
        },
        colors: [
            getScoreColor(normalizedAccessReviewScore),
            getScoreColor(normalizedPolicyViolationScore),
            getScoreColor(normalizedSoc2Score)
        ]
    }

    // Bar chart series
    const barChartSeries = [
        {
            name: 'Compliance Score',
            data: [
                normalizedAccessReviewScore,
                normalizedPolicyViolationScore,
                normalizedSoc2Score
            ]
        }
    ]

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <ReactApexChart
                            options={chartOptions}
                            series={chartSeries}
                            type="radialBar"
                            height={350}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Compliance Breakdown
                        </Typography>
                        <ReactApexChart
                            options={barChartOptions}
                            series={barChartSeries}
                            type="bar"
                            height={200}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                <strong>Access Reviews:</strong> {normalizedAccessReviewScore}% complete
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Policy Compliance:</strong> {normalizedPolicyViolationScore}% compliant
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>SOC2 Compliance:</strong> {normalizedSoc2Score}% compliant
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

ComplianceStatusChart.propTypes = {
    accessReviewScore: PropTypes.number.isRequired,
    policyViolationScore: PropTypes.number.isRequired,
    soc2Score: PropTypes.number.isRequired
}

export default ComplianceStatusChart