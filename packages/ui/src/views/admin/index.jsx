import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    Tab,
    Tabs,
    Typography
} from '@mui/material'
import {
    People as PeopleIcon,
    VpnKey as VpnKeyIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon,
    Assessment as AssessmentIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import { TabPanel } from 'ui-component/tabs/TabPanel'
import AdminDashboard from './AdminDashboard'
import UserManagement from './UserManagement'
import RolePermissionManagement from './RolePermissionManagement'
import OrganizationManagement from './OrganizationManagement'
import WorkspaceManagement from './WorkspaceManagement'
import AccessReview from './AccessReview'

const AdminPage = () => {
    const theme = useTheme()
    const [tabValue, setTabValue] = useState(0)

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    return (
        <MainCard title="Admin Panel">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="admin tabs"
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                borderBottom: `1px solid ${theme.palette.divider}`
                            }
                        }}
                    >
                        <Tab 
                            icon={<DashboardIcon />} 
                            label="Dashboard" 
                            iconPosition="start"
                            sx={{ minHeight: '72px' }}
                        />
                        <Tab 
                            icon={<PeopleIcon />} 
                            label="Users" 
                            iconPosition="start"
                            sx={{ minHeight: '72px' }}
                        />
                        <Tab 
                            icon={<VpnKeyIcon />} 
                            label="Roles & Permissions" 
                            iconPosition="start"
                            sx={{ minHeight: '72px' }}
                        />
                        <Tab 
                            icon={<BusinessIcon />} 
                            label="Organizations" 
                            iconPosition="start"
                            sx={{ minHeight: '72px' }}
                        />
                        <Tab 
                            icon={<WorkspacesIcon />} 
                            label="Workspaces" 
                            iconPosition="start"
                            sx={{ minHeight: '72px' }}
                        />
                        <Tab 
                            icon={<AssessmentIcon />} 
                            label="Access Review" 
                            iconPosition="start"
                            sx={{ minHeight: '72px' }}
                        />
                    </Tabs>
                </Grid>
                <Grid item xs={12}>
                    <TabPanel value={tabValue} index={0}>
                        <AdminDashboard />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <UserManagement />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <RolePermissionManagement />
                    </TabPanel>
                    <TabPanel value={tabValue} index={3}>
                        <OrganizationManagement />
                    </TabPanel>
                    <TabPanel value={tabValue} index={4}>
                        <WorkspaceManagement />
                    </TabPanel>
                    <TabPanel value={tabValue} index={5}>
                        <AccessReview />
                    </TabPanel>
                </Grid>
            </Grid>
        </MainCard>
    )
}

export default AdminPage