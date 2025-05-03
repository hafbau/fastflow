import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { 
    Box, 
    Drawer, 
    AppBar, 
    Toolbar, 
    List, 
    Typography, 
    Divider, 
    IconButton, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    CssBaseline,
    useMediaQuery,
    Tooltip,
    Avatar,
    Menu,
    MenuItem,
    Badge
} from '@mui/material'
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountCircleIcon,
    Logout as LogoutIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { styled } from '@mui/material/styles'

const drawerWidth = 240

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    }),
    overflowX: 'hidden'
})

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`
    }
})

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
}))

const AppBarStyled = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    })
}))

const DrawerStyled = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme)
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme)
    })
}))

const AdminLayout = ({ children }) => {
    const theme = useTheme()
    const location = useLocation()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    
    const [open, setOpen] = useState(!isMobile)
    const [anchorEl, setAnchorEl] = useState(null)
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null)
    
    const handleDrawerOpen = () => {
        setOpen(true)
    }
    
    const handleDrawerClose = () => {
        setOpen(false)
    }
    
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }
    
    const handleProfileMenuClose = () => {
        setAnchorEl(null)
    }
    
    const handleNotificationMenuOpen = (event) => {
        setNotificationAnchorEl(event.currentTarget)
    }
    
    const handleNotificationMenuClose = () => {
        setNotificationAnchorEl(null)
    }
    
    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/admin'
        },
        {
            text: 'Users',
            icon: <PeopleIcon />,
            path: '/admin/users'
        },
        {
            text: 'Organizations',
            icon: <BusinessIcon />,
            path: '/admin/organizations'
        },
        {
            text: 'Workspaces',
            icon: <WorkspacesIcon />,
            path: '/admin/workspaces'
        },
        {
            text: 'Roles & Permissions',
            icon: <SecurityIcon />,
            path: '/admin/roles'
        },
        {
            text: 'Audit Logs',
            icon: <AssessmentIcon />,
            path: '/admin/audit-logs'
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: '/admin/settings'
        }
    ]
    
    const notifications = [
        {
            id: 1,
            message: 'New user registered',
            time: '5 minutes ago'
        },
        {
            id: 2,
            message: 'New organization created',
            time: '1 hour ago'
        },
        {
            id: 3,
            message: 'System update available',
            time: '2 hours ago'
        }
    ]
    
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBarStyled position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' })
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Dashboard
                    </Typography>
                    
                    <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Notifications">
                            <IconButton
                                size="large"
                                color="inherit"
                                onClick={handleNotificationMenuOpen}
                            >
                                <Badge badgeContent={notifications.length} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Account">
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                onClick={handleProfileMenuOpen}
                            >
                                <AccountCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBarStyled>
            
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </Menu>
            
            <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxHeight: 400
                    }
                }}
            >
                <MenuItem sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Notifications</Typography>
                    <Typography variant="caption" color="primary">Mark all as read</Typography>
                </MenuItem>
                <Divider />
                {notifications.map((notification) => (
                    <MenuItem key={notification.id} onClick={handleNotificationMenuClose}>
                        <ListItemText 
                            primary={notification.message} 
                            secondary={notification.time}
                        />
                    </MenuItem>
                ))}
                <Divider />
                <MenuItem sx={{ justifyContent: 'center' }}>
                    <Typography variant="body2" color="primary">View all notifications</Typography>
                </MenuItem>
            </Menu>
            
            <DrawerStyled variant="permanent" open={open}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                        
                        return (
                            <ListItem 
                                button 
                                key={item.text} 
                                component={Link} 
                                to={item.path}
                                sx={{
                                    backgroundColor: isActive ? theme.palette.action.selected : 'inherit',
                                    '&:hover': {
                                        backgroundColor: isActive 
                                            ? theme.palette.action.selected 
                                            : theme.palette.action.hover
                                    }
                                }}
                            >
                                <Tooltip title={!open ? item.text : ''} placement="right">
                                    <ListItemIcon
                                        sx={{
                                            color: isActive ? theme.palette.primary.main : 'inherit'
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText 
                                    primary={item.text} 
                                    sx={{
                                        color: isActive ? theme.palette.primary.main : 'inherit'
                                    }}
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </DrawerStyled>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                {children}
            </Box>
        </Box>
    )
}

export default AdminLayout