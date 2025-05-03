import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Checkbox
} from '@mui/material'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import { gridSpacing } from 'store/constant'

const RolePermissionManagement = () => {
    const theme = useTheme()
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [rolePermissions, setRolePermissions] = useState([])
    const [allPermissions, setAllPermissions] = useState([])
    const [permissionCategories, setPermissionCategories] = useState([])
    const [expandedCategories, setExpandedCategories] = useState({})

    // Fetch sample data
    const fetchData = async () => {
        setLoading(true)
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample roles
            const sampleRoles = [
                {
                    id: '1',
                    name: 'System Admin',
                    description: 'Full access to all system features',
                    scope: 'System'
                },
                {
                    id: '2',
                    name: 'Organization Admin',
                    description: 'Full access to organization features',
                    scope: 'Organization'
                },
                {
                    id: '3',
                    name: 'Workspace Admin',
                    description: 'Full access to workspace features',
                    scope: 'Workspace'
                },
                {
                    id: '4',
                    name: 'Member',
                    description: 'Standard user with limited access',
                    scope: 'Organization'
                },
                {
                    id: '5',
                    name: 'Viewer',
                    description: 'Read-only access to resources',
                    scope: 'Workspace'
                }
            ]
            
            // Sample permissions
            const samplePermissions = [
                // User permissions
                {
                    id: '1',
                    name: 'user:read',
                    description: 'View user details',
                    category: 'User Management'
                },
                {
                    id: '2',
                    name: 'user:create',
                    description: 'Create new users',
                    category: 'User Management'
                },
                {
                    id: '3',
                    name: 'user:update',
                    description: 'Update user details',
                    category: 'User Management'
                },
                {
                    id: '4',
                    name: 'user:delete',
                    description: 'Delete users',
                    category: 'User Management'
                },
                
                // Organization permissions
                {
                    id: '5',
                    name: 'organization:read',
                    description: 'View organization details',
                    category: 'Organization Management'
                },
                {
                    id: '6',
                    name: 'organization:create',
                    description: 'Create new organizations',
                    category: 'Organization Management'
                },
                {
                    id: '7',
                    name: 'organization:update',
                    description: 'Update organization details',
                    category: 'Organization Management'
                },
                {
                    id: '8',
                    name: 'organization:delete',
                    description: 'Delete organizations',
                    category: 'Organization Management'
                },
                
                // Workspace permissions
                {
                    id: '9',
                    name: 'workspace:read',
                    description: 'View workspace details',
                    category: 'Workspace Management'
                },
                {
                    id: '10',
                    name: 'workspace:create',
                    description: 'Create new workspaces',
                    category: 'Workspace Management'
                }
            ]
            
            setRoles(sampleRoles)
            setAllPermissions(samplePermissions)
            
            // Extract unique categories
            const categories = [...new Set(samplePermissions.map(p => p.category))]
            setPermissionCategories(categories)
            
            // Initialize expanded state for categories
            const expandedState = {}
            categories.forEach(category => {
                expandedState[category] = true
            })
            setExpandedCategories(expandedState)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch role permissions
    const fetchRolePermissions = async (roleId) => {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Sample data - IDs of permissions assigned to the role
            let sampleRolePermissions = []
            
            if (roleId === '1') { // System Admin
                sampleRolePermissions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
            } else if (roleId === '2') { // Organization Admin
                sampleRolePermissions = ['1', '3', '5', '7', '9', '10']
            } else if (roleId === '3') { // Workspace Admin
                sampleRolePermissions = ['1', '9']
            } else if (roleId === '4') { // Member
                sampleRolePermissions = ['1', '5', '9']
            } else if (roleId === '5') { // Viewer
                sampleRolePermissions = ['1', '5', '9']
            }
            
            setRolePermissions(sampleRolePermissions)
        } catch (error) {
            console.error('Error fetching role permissions:', error)
        }
    }

    // Handle role selection
    const handleRoleSelect = async (role) => {
        setSelectedRole(role)
        await fetchRolePermissions(role.id)
    }

    // Handle toggle category expansion
    const handleToggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    // Handle toggle permission
    const handleTogglePermission = (permissionId) => {
        setRolePermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId)
            } else {
                return [...prev, permissionId]
            }
        })
    }

    // Handle toggle all permissions in category
    const handleToggleAllInCategory = (category) => {
        const categoryPermissionIds = allPermissions
            .filter(p => p.category === category)
            .map(p => p.id)
        
        const allSelected = categoryPermissionIds.every(id => rolePermissions.includes(id))
        
        if (allSelected) {
            // Remove all permissions in this category
            setRolePermissions(prev => prev.filter(id => !categoryPermissionIds.includes(id)))
        } else {
            // Add all permissions in this category
            setRolePermissions(prev => {
                const newPermissions = [...prev]
                categoryPermissionIds.forEach(id => {
                    if (!newPermissions.includes(id)) {
                        newPermissions.push(id)
                    }
                })
                return newPermissions
            })
        }
    }

    // Check if all permissions in a category are selected
    const areAllPermissionsInCategorySelected = (category) => {
        const categoryPermissionIds = allPermissions
            .filter(p => p.category === category)
            .map(p => p.id)
        
        return categoryPermissionIds.every(id => rolePermissions.includes(id))
    }

    // Check if some permissions in a category are selected
    const areSomePermissionsInCategorySelected = (category) => {
        const categoryPermissionIds = allPermissions
            .filter(p => p.category === category)
            .map(p => p.id)
        
        return categoryPermissionIds.some(id => rolePermissions.includes(id)) && 
               !categoryPermissionIds.every(id => rolePermissions.includes(id))
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
                            Roles & Permissions
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Manage roles and their permissions
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    {/* Role List */}
                    <Grid item xs={12} md={selectedRole ? 5 : 12}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <TextField
                                        placeholder="Search roles..."
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
                                        Add Role
                                    </Button>
                                </Stack>
                                
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Scope</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        Loading...
                                                    </TableCell>
                                                </TableRow>
                                            ) : roles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        No roles found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                roles.map((role) => (
                                                    <TableRow 
                                                        key={role.id} 
                                                        hover 
                                                        onClick={() => handleRoleSelect(role)}
                                                        selected={selectedRole && selectedRole.id === role.id}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell>{role.name}</TableCell>
                                                        <TableCell>{role.description}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={role.scope}
                                                                color={
                                                                    role.scope === 'System' ? 'primary' :
                                                                    role.scope === 'Organization' ? 'secondary' :
                                                                    'default'
                                                                }
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Edit Role">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        color="primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            // Handle edit
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete Role">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        color="error"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            // Handle delete
                                                                        }}
                                                                    >
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
                    </Grid>

                    {/* Role Permissions */}
                    {selectedRole && (
                        <Grid item xs={12} md={7}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h4">
                                            Permissions for {selectedRole.name}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                        >
                                            Save Permissions
                                        </Button>
                                    </Stack>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {selectedRole.description}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    {permissionCategories.map((category) => (
                                        <Box key={category} sx={{ mb: 2 }}>
                                            <ListItem 
                                                button 
                                                onClick={() => handleToggleCategory(category)}
                                                sx={{ 
                                                    bgcolor: theme.palette.background.default,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={areAllPermissionsInCategorySelected(category)}
                                                        indeterminate={areSomePermissionsInCategorySelected(category)}
                                                        onChange={() => handleToggleAllInCategory(category)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {category}
                                                        </Typography>
                                                    } 
                                                />
                                                {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </ListItem>
                                            
                                            {expandedCategories[category] && (
                                                <List component="div" disablePadding>
                                                    {allPermissions
                                                        .filter(p => p.category === category)
                                                        .map(permission => (
                                                            <ListItem 
                                                                key={permission.id} 
                                                                sx={{ pl: 4 }}
                                                            >
                                                                <ListItemIcon>
                                                                    <Checkbox
                                                                        edge="start"
                                                                        checked={rolePermissions.includes(permission.id)}
                                                                        onChange={() => handleTogglePermission(permission.id)}
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText 
                                                                    primary={permission.name} 
                                                                    secondary={permission.description} 
                                                                />
                                                            </ListItem>
                                                        ))
                                                    }
                                                </List>
                                            )}
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Grid>
    )
}

export default RolePermissionManagement