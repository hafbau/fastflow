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
    Chip
} from '@mui/material'
import {
    Storage as StorageIcon,
    Description as DocumentIcon,
    Code as CodeIcon,
    Settings as SettingsIcon,
    Folder as FolderIcon
} from '@mui/icons-material'

/**
 * Top Resources Table Component
 * Displays a table of top accessed resources
 */
const TopResourcesTable = ({ data }) => {
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

    // Get resource icon based on resource type
    const getResourceIcon = (resourceType) => {
        switch (resourceType.toLowerCase()) {
            case 'chatflow':
                return <CodeIcon fontSize="small" />
            case 'credential':
                return <SettingsIcon fontSize="small" />
            case 'document':
                return <DocumentIcon fontSize="small" />
            case 'tool':
                return <StorageIcon fontSize="small" />
            default:
                return <FolderIcon fontSize="small" />
        }
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
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
                        <Table stickyHeader aria-label="top resources table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Resource</TableCell>
                                    <TableCell align="right">Access Count</TableCell>
                                    <TableCell align="right">Unique Users</TableCell>
                                    <TableCell align="right">Read/Write</TableCell>
                                    <TableCell align="right">Last Accessed</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((resource, index) => (
                                        <TableRow hover key={index}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {getResourceIcon(resource.resourceType)}
                                                    <Box sx={{ ml: 1 }}>
                                                        <Typography variant="body2">
                                                            {resource.resourceName || `${resource.resourceType} ${resource.resourceId.substring(0, 8)}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {resource.resourceType}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={resource.accessCount}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{resource.uniqueUsers}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {resource.readCount}/{resource.writeCount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {formatDate(resource.lastAccessed)}
                                                </Typography>
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

TopResourcesTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            resourceId: PropTypes.string.isRequired,
            resourceType: PropTypes.string.isRequired,
            resourceName: PropTypes.string,
            accessCount: PropTypes.number.isRequired,
            uniqueUsers: PropTypes.number.isRequired,
            lastAccessed: PropTypes.string.isRequired,
            readCount: PropTypes.number.isRequired,
            writeCount: PropTypes.number.isRequired
        })
    ).isRequired
}

export default TopResourcesTable