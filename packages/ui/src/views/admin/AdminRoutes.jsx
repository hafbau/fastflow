import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Card,
    CardContent,
    Grid,
    Tab,
    Tabs,
    Typography
} from '@mui/material'
import {
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon,
    Security as SecurityIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material'
import { gridSpacing } from 'store/constant'

// Admin components
import AdminDashboard from './AdminDashboard'
import UserManagement from './UserManagement'
import OrganizationWorkspaceManagement from './OrganizationWorkspaceManagement'
import RolePermissionManagement from './RolePermissionManagement'
import AuditLogsPage from './AuditLogsPage'

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

function a11yProps(index) {
    return {
        id: `admin-tab-${index}`,
        'aria-controls': `admin-tabpanel-${index}`
    }
}

const AdminRoutes = () => {
    const theme = useTheme()
    const [value, setValue] = useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h3" component="div">
                            Admin Panel
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Manage users, organizations, workspaces, roles, and permissions
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="admin tabs"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTabs-indicator': {
                                    backgroundColor: theme.palette.primary.main
                                }
                            }}
                        >
                            <Tab 
                                icon={<DashboardIcon />} 
                                label="Dashboard" 
                                iconPosition="start"
                                {...a11yProps(0)} 
                            />
                            <Tab 
                                icon={<PersonIcon />} 
                                label="Users" 
                                iconPosition="start"
                                {...a11yProps(1)} 
                            />
                            <Tab 
                                icon={<BusinessIcon />} 
                                label="Organizations & Workspaces" 
                                iconPosition="start"
                                {...a11yProps(2)} 
                            />
                            <Tab 
                                icon={<SecurityIcon />} 
                                label="Roles & Permissions" 
                                iconPosition="start"
                                {...a11yProps(3)} 
                            />
                            <Tab 
                                icon={<AssessmentIcon />} 
                                label="Audit Logs" 
                                iconPosition="start"
                                {...a11yProps(4)} 
                            />
                        </Tabs>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <TabPanel value={value} index={0}>
                    <AdminDashboard />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <UserManagement />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <OrganizationWorkspaceManagement />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <RolePermissionManagement />
                </TabPanel>
                <TabPanel value={value} index={4}>
                    <AuditLogsPage />
                </TabPanel>
            </Grid>
        </Grid>
    )
}

export default AdminRoutes