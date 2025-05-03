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
    Avatar
} from '@mui/material'
import { 
    Person as PersonIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material'

/**
 * Top Users Table Component
 * Displays a table of top active users
 */
const TopUsersTable = ({ data }) => {
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

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    // Get user initials for avatar
    const getUserInitials = (userName) => {
        if (!userName) return 'U'
        
        const names = userName.split(' ')
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase()
        } else {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
        }
    }

    // Get random color for avatar based on user ID
    const getAvatarColor = (userId) => {
        const colors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.info.main
        ]
        
        // Simple hash function to get consistent color for same user
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    return (
        <Box>
            {data.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <Typography variant="body1">No data available</Typography>
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="top users table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell align="right">Access Count</TableCell>
                                    <TableCell align="right">Unique Resources</TableCell>
                                    <TableCell align="right">Read/Write</TableCell>
                                    <TableCell align="right">Last Active</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user, index) => (
                                        <TableRow hover key={index}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar 
                                                        sx={{ 
                                                            bgcolor: getAvatarColor(user.userId),
                                                            width: 32,
                                                            height: 32
                                                        }}
                                                    >
                                                        {getUserInitials(user.userName)}
                                                    </Avatar>
                                                    <Box sx={{ ml: 1 }}>
                                                        <Typography variant="body2">
                                                            {user.userName || `User ${user.userId.substring(0, 8)}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {user.resourceTypes?.join(', ') || 'Various resources'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={user.accessCount}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{user.uniqueResources}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {user.readCount}/{user.writeCount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                                                    <Typography variant="body2">
                                                        {formatDate(user.lastActive)}
                                                    </Typography>
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

TopUsersTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            userName: PropTypes.string,
            accessCount: PropTypes.number.isRequired,
            uniqueResources: PropTypes.number.isRequired,
            lastActive: PropTypes.string.isRequired,
            readCount: PropTypes.number.isRequired,
            writeCount: PropTypes.number.isRequired,
            resourceTypes: PropTypes.arrayOf(PropTypes.string)
        })
    ).isRequired
}

export default TopUsersTable