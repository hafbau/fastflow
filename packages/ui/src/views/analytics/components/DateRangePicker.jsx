import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material'

/**
 * Date Range Picker Component
 * Allows selecting a date range and granularity
 */
const DateRangePicker = ({ open, onClose, dateRange, onDateRangeChange }) => {
    const theme = useTheme()
    
    // State for selected date range
    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        granularity: dateRange.granularity
    })
    
    // Handle start date change
    const handleStartDateChange = (date) => {
        setSelectedDateRange({
            ...selectedDateRange,
            startDate: date
        })
    }
    
    // Handle end date change
    const handleEndDateChange = (date) => {
        setSelectedDateRange({
            ...selectedDateRange,
            endDate: date
        })
    }
    
    // Handle granularity change
    const handleGranularityChange = (event) => {
        setSelectedDateRange({
            ...selectedDateRange,
            granularity: event.target.value
        })
    }
    
    // Handle apply button click
    const handleApply = () => {
        onDateRangeChange(selectedDateRange)
    }
    
    // Handle preset selection
    const handlePresetSelection = (preset) => {
        const now = new Date()
        let startDate = new Date()
        let granularity = 'daily'
        
        switch (preset) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                granularity = 'hourly'
                break
            case 'yesterday':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
                granularity = 'hourly'
                break
            case 'last7days':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
                break
            case 'last30days':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
                break
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
                now.setDate(lastDayOfLastMonth.getDate())
                break
            case 'last3months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
                granularity = 'weekly'
                break
            case 'last6months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
                granularity = 'weekly'
                break
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1)
                granularity = 'monthly'
                break
            case 'lastYear':
                startDate = new Date(now.getFullYear() - 1, 0, 1)
                now.setFullYear(now.getFullYear() - 1)
                now.setMonth(11)
                now.setDate(31)
                granularity = 'monthly'
                break
            default:
                break
        }
        
        setSelectedDateRange({
            startDate,
            endDate: new Date(),
            granularity
        })
    }
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>Select Date Range</DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {/* Presets */}
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('today')}
                                >
                                    Today
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('yesterday')}
                                >
                                    Yesterday
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('last7days')}
                                >
                                    Last 7 Days
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('last30days')}
                                >
                                    Last 30 Days
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('thisMonth')}
                                >
                                    This Month
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('lastMonth')}
                                >
                                    Last Month
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('last3months')}
                                >
                                    Last 3 Months
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('last6months')}
                                >
                                    Last 6 Months
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('thisYear')}
                                >
                                    This Year
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePresetSelection('lastYear')}
                                >
                                    Last Year
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    {/* Date Pickers */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={selectedDateRange.startDate}
                            onChange={(e) => handleStartDateChange(new Date(e.target.value))}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="End Date"
                            type="date"
                            value={selectedDateRange.endDate}
                            onChange={(e) => handleEndDateChange(new Date(e.target.value))}
                            fullWidth
                            InputProps={{
                                inputProps: {
                                    min: selectedDateRange.startDate.toISOString().split('T')[0]
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Granularity</InputLabel>
                            <Select
                                value={selectedDateRange.granularity}
                                onChange={handleGranularityChange}
                                label="Granularity"
                            >
                                <MenuItem value="hourly">Hourly</MenuItem>
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleApply} variant="contained" color="primary">
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DateRangePicker