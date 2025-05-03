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
    Tooltip
} from '@mui/material'
import {
    Block as BlockIcon,
    Person as PersonIcon,
    Delete as DeleteIcon,
    Info as InfoIcon
} from '@mui/icons-material'

/**
 * Unused Permissions Table Component
 * Displays a table of unused permissions
 */
const UnusedPermissionsTable = ({ data }) => {
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
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    return (
        <Box>
            {data.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <Typography variant="body1">No unused permissions found</Typography>
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="unused permissions table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Permission</TableCell>
                                    <TableCell align="center">Scope</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell align="right">Last Used</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((permission, index) => (
                                        <TableRow hover key={index}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <BlockIcon 
                                                        fontSize="small" 
                                                        sx={{ 
                                                            color: theme.palette.error.light,
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
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PersonIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                                    <Typography variant="body2">
                                                        {permission.assignedTo.length} {permission.assignedTo.length === 1 ? 'user' : 'users'}
                                                    </Typography>
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
                                                    <Tooltip title="Remove Permission">
                                                        <IconButton size="small" sx={{ color: theme.palette.error.main }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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

UnusedPermissionsTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            scope: PropTypes.string.isRequired,
            assignedTo: PropTypes.array.isRequired,
            lastUsed: PropTypes.string
        })
    ).isRequired
}

export default UnusedPermissionsTable