import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Grid,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Switch,
    TextField,
    Typography,
    useTheme
} from '@mui/material'
import { IconArrowBack, IconDeviceFloppy } from '@tabler/icons-react'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import { useSelector } from 'react-redux'
import axios from 'utils/axios'
import { toast } from 'react-toastify'
import Loader from 'ui-component/loading/Loader'

const AccessReviewScheduleForm = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const customization = useSelector((state) => state.customization)

    const [loading, setLoading] = useState(isEditMode)
    const [submitting, setSubmitting] = useState(false)
    const [organizations, setOrganizations] = useState([])
    const [workspaces, setWorkspaces] = useState([])
    const [users, setUsers] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        frequency: 'quarterly',
        scope: 'organization',
        organizationId: '',
        workspaceId: '',
        createdBy: '',
        assignedTo: '',
        status: 'active',
        durationDays: 7,
        settings: {
            includeUserRoles: true,
            includeResourcePermissions: true,
            includeDormantAccounts: false,
            includeExcessivePermissions: false,
            lastLoginThresholdDays: 90
        }
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch organizations
                const orgResponse = await axios.get('/api/organizations')
                setOrganizations(orgResponse.data.data || [])

                // Fetch users
                const usersResponse = await axios.get('/api/users')
                setUsers(usersResponse.data.data || [])

                // If editing, fetch the schedule
                if (isEditMode) {
                    const scheduleResponse = await axios.get(`/api/access-reviews/schedules/${id}`)
                    const scheduleData = scheduleResponse.data.data

                    // If the schedule has an organization, fetch its workspaces
                    if (scheduleData.organizationId) {
                        const workspacesResponse = await axios.get(`/api/organizations/${scheduleData.organizationId}/workspaces`)
                        setWorkspaces(workspacesResponse.data.data || [])
                    }

                    // Set form data from the response
                    setFormData({
                        name: scheduleData.name || '',
                        description: scheduleData.description || '',
                        frequency: scheduleData.frequency || 'quarterly',
                        scope: scheduleData.scope || 'organization',
                        organizationId: scheduleData.organizationId || '',
                        workspaceId: scheduleData.workspaceId || '',
                        createdBy: scheduleData.createdBy || '',
                        assignedTo: scheduleData.assignedTo || '',
                        status: scheduleData.status || 'active',
                        durationDays: scheduleData.durationDays || 7,
                        settings: {
                            includeUserRoles: scheduleData.settings?.includeUserRoles !== false,
                            includeResourcePermissions: scheduleData.settings?.includeResourcePermissions !== false,
                            includeDormantAccounts: scheduleData.settings?.includeDormantAccounts === true,
                            includeExcessivePermissions: scheduleData.settings?.includeExcessivePermissions === true,
                            lastLoginThresholdDays: scheduleData.settings?.lastLoginThresholdDays || 90
                        }
                    })
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error('Failed to load data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, isEditMode])

    const handleOrganizationChange = async (orgId) => {
        try {
            if (orgId) {
                const workspacesResponse = await axios.get(`/api/organizations/${orgId}/workspaces`)
                setWorkspaces(workspacesResponse.data.data || [])
            } else {
                setWorkspaces([])
            }

            // Update form data
            setFormData({
                ...formData,
                organizationId: orgId,
                workspaceId: '' // Reset workspace when organization changes
            })
        } catch (error) {
            console.error('Error fetching workspaces:', error)
            toast.error('Failed to load workspaces')
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: undefined
            })
        }
    }

    const handleSettingsChange = (e) => {
        const { name, value, checked, type } = e.target
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                [name]: type === 'checkbox' ? checked : value
            }
        })
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (formData.scope === 'organization' && !formData.organizationId) {
            newErrors.organizationId = 'Organization is required for organization scope'
        }

        if (formData.scope === 'workspace' && !formData.workspaceId) {
            newErrors.workspaceId = 'Workspace is required for workspace scope'
        }

        if (!formData.assignedTo) {
            newErrors.assignedTo = 'Assigned reviewer is required'
        }

        if (!formData.durationDays || formData.durationDays < 1) {
            newErrors.durationDays = 'Duration must be at least 1 day'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return
        }

        try {
            setSubmitting(true)

            // Prepare data for API
            const apiData = {
                ...formData,
                durationDays: parseInt(formData.durationDays, 10),
                settings: {
                    ...formData.settings,
                    lastLoginThresholdDays: parseInt(formData.settings.lastLoginThresholdDays, 10)
                }
            }

            // Create or update the schedule
            if (isEditMode) {
                await axios.put(`/api/access-reviews/schedules/${id}`, apiData)
                toast.success('Schedule updated successfully')
            } else {
                await axios.post('/api/access-reviews/schedules', apiData)
                toast.success('Schedule created successfully')
            }

            // Navigate back to the list
            navigate('/access-reviews/schedules')
        } catch (error) {
            console.error('Error saving schedule:', error)
            toast.error(error.response?.data?.message || 'Failed to save schedule')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/access-reviews/schedules')
    }

    if (loading) {
        return <Loader />
    }

    return (
        <MainCard title={isEditMode ? 'Edit Access Review Schedule' : 'Create Access Review Schedule'}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            error={Boolean(errors.name)}
                                            helperText={errors.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Frequency</InputLabel>
                                            <Select
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleInputChange}
                                                label="Frequency"
                                            >
                                                <MenuItem value="daily">Daily</MenuItem>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                                <MenuItem value="quarterly">Quarterly</MenuItem>
                                                <MenuItem value="semi_annually">Semi-Annually</MenuItem>
                                                <MenuItem value="annually">Annually</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                label="Status"
                                            >
                                                <MenuItem value="active">Active</MenuItem>
                                                <MenuItem value="paused">Paused</MenuItem>
                                                <MenuItem value="disabled">Disabled</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                                {formData.status === 'active'
                                                    ? 'Schedule will automatically run when due'
                                                    : formData.status === 'paused'
                                                    ? 'Schedule will not run automatically but will maintain next run date'
                                                    : 'Schedule is disabled and will not run'}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <FormLabel>Scope</FormLabel>
                                            <RadioGroup
                                                row
                                                name="scope"
                                                value={formData.scope}
                                                onChange={handleInputChange}
                                            >
                                                <FormControlLabel
                                                    value="organization"
                                                    control={<Radio />}
                                                    label="Organization"
                                                />
                                                <FormControlLabel
                                                    value="workspace"
                                                    control={<Radio />}
                                                    label="Workspace"
                                                />
                                                <FormControlLabel
                                                    value="resource"
                                                    control={<Radio />}
                                                    label="Resource"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Review Duration (days)"
                                            name="durationDays"
                                            type="number"
                                            value={formData.durationDays}
                                            onChange={handleInputChange}
                                            InputProps={{ inputProps: { min: 1 } }}
                                            error={Boolean(errors.durationDays)}
                                            helperText={errors.durationDays || 'Number of days to complete the review'}
                                        />
                                    </Grid>
                                    {formData.scope === 'organization' && (
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth error={Boolean(errors.organizationId)}>
                                                <InputLabel>Organization</InputLabel>
                                                <Select
                                                    name="organizationId"
                                                    value={formData.organizationId}
                                                    onChange={(e) => handleOrganizationChange(e.target.value)}
                                                    label="Organization"
                                                >
                                                    <MenuItem value="">
                                                        <em>Select an organization</em>
                                                    </MenuItem>
                                                    {organizations.map((org) => (
                                                        <MenuItem key={org.id} value={org.id}>
                                                            {org.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.organizationId && (
                                                    <FormHelperText>{errors.organizationId}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    )}
                                    {formData.scope === 'workspace' && (
                                        <>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth error={Boolean(errors.organizationId)}>
                                                    <InputLabel>Organization</InputLabel>
                                                    <Select
                                                        name="organizationId"
                                                        value={formData.organizationId}
                                                        onChange={(e) => handleOrganizationChange(e.target.value)}
                                                        label="Organization"
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select an organization</em>
                                                        </MenuItem>
                                                        {organizations.map((org) => (
                                                            <MenuItem key={org.id} value={org.id}>
                                                                {org.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.organizationId && (
                                                        <FormHelperText>{errors.organizationId}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth error={Boolean(errors.workspaceId)}>
                                                    <InputLabel>Workspace</InputLabel>
                                                    <Select
                                                        name="workspaceId"
                                                        value={formData.workspaceId}
                                                        onChange={handleInputChange}
                                                        label="Workspace"
                                                        disabled={!formData.organizationId}
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select a workspace</em>
                                                        </MenuItem>
                                                        {workspaces.map((workspace) => (
                                                            <MenuItem key={workspace.id} value={workspace.id}>
                                                                {workspace.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.workspaceId && (
                                                        <FormHelperText>{errors.workspaceId}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        </>
                                    )}
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth error={Boolean(errors.assignedTo)}>
                                            <InputLabel>Assigned To</InputLabel>
                                            <Select
                                                name="assignedTo"
                                                value={formData.assignedTo}
                                                onChange={handleInputChange}
                                                label="Assigned To"
                                            >
                                                <MenuItem value="">
                                                    <em>Select a reviewer</em>
                                                </MenuItem>
                                                {users.map((user) => (
                                                    <MenuItem key={user.id} value={user.id}>
                                                        {user.name || user.email}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.assignedTo && <FormHelperText>{errors.assignedTo}</FormHelperText>}
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    Review Settings
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.settings.includeUserRoles}
                                                    onChange={handleSettingsChange}
                                                    name="includeUserRoles"
                                                    color="primary"
                                                />
                                            }
                                            label="Include User Roles"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.settings.includeResourcePermissions}
                                                    onChange={handleSettingsChange}
                                                    name="includeResourcePermissions"
                                                    color="primary"
                                                />
                                            }
                                            label="Include Resource Permissions"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.settings.includeDormantAccounts}
                                                    onChange={handleSettingsChange}
                                                    name="includeDormantAccounts"
                                                    color="primary"
                                                />
                                            }
                                            label="Include Dormant Accounts"
                                        />
                                    </Grid>
                                    {formData.settings.includeDormantAccounts && (
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Login Threshold (days)"
                                                name="lastLoginThresholdDays"
                                                type="number"
                                                value={formData.settings.lastLoginThresholdDays}
                                                onChange={handleSettingsChange}
                                                InputProps={{ inputProps: { min: 1 } }}
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.settings.includeExcessivePermissions}
                                                    onChange={handleSettingsChange}
                                                    name="includeExcessivePermissions"
                                                    color="primary"
                                                />
                                            }
                                            label="Include Excessive Permissions"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleCancel}
                                startIcon={<IconArrowBack />}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<IconDeviceFloppy />}
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </MainCard>
    )
}

export default AccessReviewScheduleForm