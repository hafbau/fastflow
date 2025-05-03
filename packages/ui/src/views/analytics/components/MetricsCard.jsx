import React from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Tooltip,
    IconButton
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'

/**
 * Metrics Card Component
 * Displays a single metric with title, value, and trend
 */
const MetricsCard = ({
    title,
    value,
    previousValue,
    unit = '',
    trend = 0,
    trendLabel = '',
    info = '',
    color = 'primary',
    icon: Icon,
    onClick
}) => {
    const theme = useTheme()
    
    // Calculate trend percentage if not provided
    const calculatedTrend = trend || (previousValue && previousValue !== 0
        ? ((value - previousValue) / previousValue) * 100
        : 0)
    
    // Determine trend direction
    const trendDirection = calculatedTrend > 0 ? 'up' : calculatedTrend < 0 ? 'down' : 'flat'
    
    // Format trend value
    const formattedTrend = Math.abs(calculatedTrend).toFixed(1)
    
    // Determine trend color
    const getTrendColor = () => {
        if (trendDirection === 'up') {
            return theme.palette.success.main
        } else if (trendDirection === 'down') {
            return theme.palette.error.main
        }
        return theme.palette.text.secondary
    }
    
    // Get trend icon
    const getTrendIcon = () => {
        if (trendDirection === 'up') {
            return <TrendingUpIcon fontSize="small" />
        } else if (trendDirection === 'down') {
            return <TrendingDownIcon fontSize="small" />
        }
        return <TrendingFlatIcon fontSize="small" />
    }
    
    // Format value
    const formatValue = (val) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + 'M'
            } else if (val >= 1000) {
                return (val / 1000).toFixed(1) + 'K'
            }
            return val.toString()
        }
        return val
    }
    
    return (
        <Card 
            sx={{ 
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': onClick ? {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    {info && (
                        <Tooltip title={info} arrow placement="top">
                            <IconButton size="small">
                                <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {Icon && (
                        <Box 
                            sx={{ 
                                mr: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                bgcolor: theme.palette[color].lighter,
                                color: theme.palette[color].main,
                                borderRadius: '50%',
                                width: 40,
                                height: 40
                            }}
                        >
                            <Icon />
                        </Box>
                    )}
                    <Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            {formatValue(value)}{unit}
                        </Typography>
                    </Box>
                </Box>
                
                {calculatedTrend !== 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                            icon={getTrendIcon()}
                            label={`${formattedTrend}% ${trendLabel}`}
                            size="small"
                            sx={{
                                bgcolor: `${getTrendColor()}20`,
                                color: getTrendColor(),
                                borderRadius: 1
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

export default MetricsCard