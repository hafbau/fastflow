import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Divider,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import DownloadIcon from '@mui/icons-material/Download'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

/**
 * Analytics Chart Component
 * Displays various chart types for analytics data
 */
const AnalyticsChart = ({
    title,
    subtitle,
    data = [],
    type = 'line',
    height = 400,
    loading = false,
    error = null,
    xAxisKey = 'name',
    yAxisKey = 'value',
    series = [],
    colors = [],
    info = '',
    options = [],
    selectedOption = '',
    onOptionChange = () => {},
    onDownload = () => {},
    onFullscreen = () => {}
}) => {
    const theme = useTheme()
    const [chartData, setChartData] = useState([])
    
    // Set default colors if not provided
    const defaultColors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main
    ]
    
    const chartColors = colors.length > 0 ? colors : defaultColors
    
    // Format data for charts
    useEffect(() => {
        if (data && data.length > 0) {
            setChartData(data)
        } else {
            setChartData([])
        }
    }, [data])
    
    // Render chart based on type
    const renderChart = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 100 }}>
                    <CircularProgress />
                </Box>
            )
        }
        
        if (error) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 100 }}>
                    <p>{error}</p>
                </Box>
            )
        }
        
        if (chartData.length === 0) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 100 }}>
                    <p>No data available</p>
                </Box>
            )
        }
        
        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={height - 100}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisKey} />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            {series.length > 0 ? (
                                series.map((item, index) => (
                                    <Line
                                        key={item.dataKey}
                                        type="monotone"
                                        dataKey={item.dataKey}
                                        name={item.name || item.dataKey}
                                        stroke={item.color || chartColors[index % chartColors.length]}
                                        activeDot={{ r: 8 }}
                                    />
                                ))
                            ) : (
                                <Line
                                    type="monotone"
                                    dataKey={yAxisKey}
                                    stroke={chartColors[0]}
                                    activeDot={{ r: 8 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                )
            
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={height - 100}>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisKey} />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            {series.length > 0 ? (
                                series.map((item, index) => (
                                    <Bar
                                        key={item.dataKey}
                                        dataKey={item.dataKey}
                                        name={item.name || item.dataKey}
                                        fill={item.color || chartColors[index % chartColors.length]}
                                    />
                                ))
                            ) : (
                                <Bar dataKey={yAxisKey} fill={chartColors[0]} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                )
            
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={height - 100}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisKey} />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            {series.length > 0 ? (
                                series.map((item, index) => (
                                    <Area
                                        key={item.dataKey}
                                        type="monotone"
                                        dataKey={item.dataKey}
                                        name={item.name || item.dataKey}
                                        fill={item.color || chartColors[index % chartColors.length]}
                                        stroke={item.color || chartColors[index % chartColors.length]}
                                        fillOpacity={0.3}
                                    />
                                ))
                            ) : (
                                <Area
                                    type="monotone"
                                    dataKey={yAxisKey}
                                    fill={chartColors[0]}
                                    stroke={chartColors[0]}
                                    fillOpacity={0.3}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                )
            
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={height - 100}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={yAxisKey}
                                nameKey={xAxisKey}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            <Legend />
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )
            
            default:
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 100 }}>
                        <p>Unsupported chart type</p>
                    </Box>
                )
        }
    }
    
    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader
                title={title}
                subheader={subtitle}
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {options.length > 0 && (
                            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
                                <Select
                                    value={selectedOption}
                                    onChange={(e) => onOptionChange(e.target.value)}
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Chart options' }}
                                >
                                    {options.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        
                        {info && (
                            <Tooltip title={info} arrow placement="top">
                                <IconButton size="small">
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        
                        <Tooltip title="Download" arrow placement="top">
                            <IconButton size="small" onClick={onDownload}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Fullscreen" arrow placement="top">
                            <IconButton size="small" onClick={onFullscreen}>
                                <FullscreenIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
                {renderChart()}
            </CardContent>
        </Card>
    )
}

export default AnalyticsChart