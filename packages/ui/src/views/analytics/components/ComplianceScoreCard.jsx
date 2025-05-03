import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Typography, Box, LinearProgress, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Chart from 'react-apexcharts'

const ComplianceScoreCard = ({ score, categories }) => {
    const theme = useTheme()
    
    // Determine color based on score
    const getScoreColor = (value) => {
        if (value >= 80) return theme.palette.success.main
        if (value >= 60) return theme.palette.warning.main
        return theme.palette.error.main
    }
    
    const scoreColor = getScoreColor(score)
    
    // Prepare data for radar chart
    const categoryNames = Object.keys(categories || {})
    const categoryScores = categoryNames.map(key => (categories[key]?.score || 0))
    
    const chartData = {
        series: [
            {
                name: 'Compliance Score',
                data: categoryScores
            }
        ],
        options: {
            chart: {
                type: 'radar',
                toolbar: {
                    show: false
                }
            },
            colors: [theme.palette.primary.main],
            stroke: {
                width: 2
            },
            fill: {
                opacity: 0.4
            },
            markers: {
                size: 5
            },
            xaxis: {
                categories: categoryNames.map(key => categories[key]?.name || key)
            },
            yaxis: {
                min: 0,
                max: 100
            },
            dataLabels: {
                enabled: true,
                background: {
                    enabled: true,
                    borderRadius: 2
                }
            },
            tooltip: {
                theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
                y: {
                    formatter: (value) => `${Math.round(value)}%`
                }
            }
        }
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h4" gutterBottom>
                    Compliance Score
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'inline-flex',
                            mr: 3
                        }}
                    >
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                border: `8px solid ${scoreColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="h3" component="div" color={scoreColor}>
                                {Math.round(score)}%
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" gutterBottom>
                            Overall compliance score based on SOC2 requirements, access reviews, and policy violations.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={score}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: theme.palette.background.default,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: scoreColor
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                
                {categoryNames.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Compliance by Category
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Chart
                                    options={chartData.options}
                                    series={chartData.series}
                                    type="radar"
                                    height={300}
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                {categoryNames.map(key => (
                                    <Box key={key} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1">
                                                {categories[key]?.name || key}
                                            </Typography>
                                            <Typography variant="body1" color={getScoreColor(categories[key]?.score || 0)}>
                                                {Math.round(categories[key]?.score || 0)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={categories[key]?.score || 0}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: theme.palette.background.default,
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: getScoreColor(categories[key]?.score || 0)
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

ComplianceScoreCard.propTypes = {
    score: PropTypes.number.isRequired,
    categories: PropTypes.object
}

ComplianceScoreCard.defaultProps = {
    categories: {}
}

export default ComplianceScoreCard