import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    LinearProgress
} from '@mui/material'
import {
    Check as CheckIcon,
    Person as PersonIcon,
    Info as InfoIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material'

/**
 * Most Used Permissions Table Component
 * Displays a table of most frequently used permissions
 */
const MostUsedPermissionsTable = ({ data }) => {
    const theme = useTheme()
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    // Get permission scope color
    const getScopeColor = (scope) => {
        switch (scope.toLowerCase()) {
            case 'system':
                return theme.palette.error.main
            case 'organization':
                return theme.palette.warning.main
            case 'workspace':
                return theme.palette.info.main
            case 'resource':
                return theme.palette.success.main
            default:
                return theme.palette.grey[500]
        }
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    // Get max usage count for normalization
    const maxUsageCount = data.length > 0 
        ? Math.max(...data.map(permission => permission.usageCount))
        : 0

    return (
        <Box>
            {data.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <Typography variant="body1">No permission usage data available</Typography>
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="most used permissions table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Permission</TableCell>
                                    <TableCell align="center">Scope</TableCell>
                                    <TableCell align="right">Usage Count</TableCell>
                                    <TableCell>Usage Trend</TableCell>
                                    <TableCell align="right">Last Used</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((permission, index) => {
                                        // Calculate normalized usage percentage for progress bar
                                        const usagePercentage = maxUsageCount > 0 
                                            ? (permission.usageCount / maxUsageCount) * 100
                                            : 0
                                            
                                        return (
                                            <TableRow hover key={index}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <CheckIcon 
                                                            fontSize="small" 
                                                            sx={{ 
                                                                color: theme.palette.success.main,
                                                                mr: 1
                                                            }} 
                                                        />
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {permission.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {permission.description || 'No description available'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={permission.scope}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getScopeColor(permission.scope),
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={permission.usageCount}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        <Box sx={{ width: '100%', mr: 1 }}>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={usagePercentage} 
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 5,
                                                                    backgroundColor: theme.palette.grey[200],
                                                                    '& .MuiLinearProgress-bar': {
                                                                        borderRadius: 5,
                                                                        backgroundColor: theme.palette.primary.main
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ minWidth: 35 }}>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {Math.round(usagePercentage)}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {formatDate(permission.lastUsed)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Tooltip title="View Details">
                                                            <IconButton size="small">
                                                                <InfoIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="View Usage">
                                                            <IconButton size="small" color="primary">
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}
        </Box>
    )
}

MostUsedPermissionsTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            scope: PropTypes.string.isRequired,
            usageCount: PropTypes.number.isRequired,
            lastUsed: PropTypes.string.isRequired,
            usageByUser: PropTypes.object
        })
    ).isRequired
}

export default MostUsedPermissionsTable