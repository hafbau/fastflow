import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon
} from '@mui/icons-material'
import { gridSpacing } from 'store/constant'

const OrganizationWorkspaceManagement = () => {
    const theme = useTheme()
    const [tabValue, setTabValue] = useState(0)
    const [organizations, setOrganizations] = useState([])
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch sample data
    const fetchData = async () => {
        setLoading(true)
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample organizations
            const sampleOrganizations = [
                {
                    id: '1',
                    name: 'Acme Corp',
                    description: 'A global leader in innovation',
                    memberCount: 42,
                    workspaceCount: 8,
                    isActive: true
                },
                {
                    id: '2',
                    name: 'Globex',
                    description: 'International technology corporation',
                    memberCount: 28,
                    workspaceCount: 5,
                    isActive: true
                },
                {
                    id: '3',
                    name: 'Initech',
                    description: 'Software development company',
                    memberCount: 15,
                    workspaceCount: 3,
                    isActive: true
                }
            ]
            
            // Sample workspaces
            const sampleWorkspaces = [
                {
                    id: '1',
                    name: 'Development',
                    description: 'Software development workspace',
                    organization: 'Acme Corp',
                    memberCount: 15,
                    isActive: true
                },
                {
                    id: '2',
                    name: 'Marketing',
                    description: 'Marketing and communications workspace',
                    organization: 'Acme Corp',
                    memberCount: 8,
                    isActive: true
                },
                {
                    id: '3',
                    name: 'Research',
                    description: 'R&D workspace',
                    organization: 'Globex',
                    memberCount: 12,
                    isActive: true
                }
            ]
            
            setOrganizations(sampleOrganizations)
            setWorkspaces(sampleWorkspaces)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    // Fetch data on component mount
    useEffect(() => {
        fetchData()
    }, [])

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" component="div">
                            Organizations & Workspaces
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Manage organizations and workspaces
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12}>
                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="organization workspace tabs"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTabs-indicator': {
                                    backgroundColor: theme.palette.primary.main
                                }
                            }}
                        >
                            <Tab 
                                icon={<BusinessIcon />} 
                                label="Organizations" 
                                iconPosition="start"
                            />
                            <Tab 
                                icon={<WorkspacesIcon />} 
                                label="Workspaces" 
                                iconPosition="start"
                            />
                        </Tabs>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12}>
                {/* Organizations Tab */}
                {tabValue === 0 && (
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <TextField
                                    placeholder="Search organizations..."
                                    variant="outlined"
                                    size="small"
                                    sx={{ width: 300 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                >
                                    Add Organization
                                </Button>
                            </Stack>
                            
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Members</TableCell>
                                            <TableCell>Workspaces</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : organizations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No organizations found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            organizations.map((org) => (
                                                <TableRow key={org.id}>
                                                    <TableCell>{org.name}</TableCell>
                                                    <TableCell>{org.description}</TableCell>
                                                    <TableCell>{org.memberCount}</TableCell>
                                                    <TableCell>{org.workspaceCount}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={org.isActive ? 'Active' : 'Inactive'}
                                                            color={org.isActive ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <Tooltip title="Edit">
                                                                <IconButton size="small" color="primary">
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton size="small" color="error">
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
                
                {/* Workspaces Tab */}
                {tabValue === 1 && (
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <TextField
                                    placeholder="Search workspaces..."
                                    variant="outlined"
                                    size="small"
                                    sx={{ width: 300 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                >
                                    Add Workspace
                                </Button>
                            </Stack>
                            
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Organization</TableCell>
                                            <TableCell>Members</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : workspaces.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No workspaces found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            workspaces.map((workspace) => (
                                                <TableRow key={workspace.id}>
                                                    <TableCell>{workspace.name}</TableCell>
                                                    <TableCell>{workspace.description}</TableCell>
                                                    <TableCell>{workspace.organization}</TableCell>
                                                    <TableCell>{workspace.memberCount}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={workspace.isActive ? 'Active' : 'Inactive'}
                                                            color={workspace.isActive ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <Tooltip title="Edit">
                                                                <IconButton size="small" color="primary">
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton size="small" color="error">
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </Grid>
    )
}

export default OrganizationWorkspaceManagement