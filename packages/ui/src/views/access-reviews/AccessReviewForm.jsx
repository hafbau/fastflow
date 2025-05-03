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
import { IconArrowBack, IconDeviceFloppy, IconPlaylistAdd } from '@tabler/icons-react'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import { useSelector } from 'react-redux'
import axios from 'utils/axios'
import { toast } from 'react-toastify'
import Loader from 'ui-component/loading/Loader'

const AccessReviewForm = () => {
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
        type: 'ad_hoc',
        scope: 'organization',
        organizationId: '',
        workspaceId: '',
        assignedTo: '',
        dueDate: '',
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

                // If editing, fetch the access review
                if (isEditMode) {
                    const reviewResponse = await axios.get(`/api/access-reviews/${id}`)
                    const reviewData = reviewResponse.data.data

                    // If the review has an organization, fetch its workspaces
                    if (reviewData.organizationId) {
                        const workspacesResponse = await axios.get(`/api/organizations/${reviewData.organizationId}/workspaces`)
                        setWorkspaces(workspacesResponse.data.data || [])
                    }

                    // Set form data from the response
                    setFormData({
                        name: reviewData.name || '',
                        description: reviewData.description || '',
                        type: reviewData.type || 'ad_hoc',
                        scope: reviewData.scope || 'organization',
                        organizationId: reviewData.organizationId || '',
                        workspaceId: reviewData.workspaceId || '',
                        assignedTo: reviewData.assignedTo || '',
                        dueDate: reviewData.dueDate ? reviewData.dueDate.substring(0, 10) : '',
                        settings: {
                            includeUserRoles: reviewData.settings?.includeUserRoles !== false,
                            includeResourcePermissions: reviewData.settings?.includeResourcePermissions !== false,
                            includeDormantAccounts: reviewData.settings?.includeDormantAccounts === true,
                            includeExcessivePermissions: reviewData.settings?.includeExcessivePermissions === true,
                            lastLoginThresholdDays: reviewData.settings?.lastLoginThresholdDays || 90
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
                settings: {
                    ...formData.settings,
                    lastLoginThresholdDays: parseInt(formData.settings.lastLoginThresholdDays, 10)
                }
            }

            // Create or update the access review
            if (isEditMode) {
                await axios.put(`/api/access-reviews/${id}`, apiData)
                toast.success('Access review updated successfully')
            } else {
                await axios.post('/api/access-reviews', apiData)
                toast.success('Access review created successfully')
            }

            // Navigate back to the list
            navigate('/access-reviews')
        } catch (error) {
            console.error('Error saving access review:', error)
            toast.error(error.response?.data?.message || 'Failed to save access review')
        } finally {
            setSubmitting(false)
        }
    }

    const handleGenerateItems = async () => {
        try {
            setSubmitting(true)
            
            const options = {
                includeUserRoles: formData.settings.includeUserRoles,
                includeResourcePermissions: formData.settings.includeResourcePermissions,
                includeDormantAccounts: formData.settings.includeDormantAccounts,
                includeExcessivePermissions: formData.settings.includeExcessivePermissions,
                lastLoginThresholdDays: parseInt(formData.settings.lastLoginThresholdDays, 10)
            }
            
            const response = await axios.post(`/api/access-reviews/${id}/items/generate`, options)
            
            toast.success(`Generated ${response.data.data.itemsGenerated} review items`)
            
            // Navigate to the review view
            navigate(`/access-reviews/view/${id}`)
        } catch (error) {
            console.error('Error generating review items:', error)
            toast.error(error.response?.data?.message || 'Failed to generate review items')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/access-reviews')
    }

    if (loading) {
        return <Loader />
    }

    return (
        <MainCard title={isEditMode ? 'Edit Access Review' : 'Create Access Review'}>
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
                                            <FormLabel>Type</FormLabel>
                                            <RadioGroup
                                                row
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                            >
                                                <FormControlLabel
                                                    value="ad_hoc"
                                                    control={<Radio />}
                                                    label="Ad-hoc"
                                                />
                                                <FormControlLabel
                                                    value="scheduled"
                                                    control={<Radio />}
                                                    label="Scheduled"
                                                    disabled={!isEditMode}
                                                />
                                            </RadioGroup>
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
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Due Date"
                                            name="dueDate"
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            InputLabelProps={{
                                                shrink: true
                                            }}
                                            error={Boolean(errors.dueDate)}
                                            helperText={errors.dueDate}
                                        />
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
                            <Box>
                                {isEditMode && (
                                    <Button
                                        variant="contained"
                                        color="info"
                                        onClick={handleGenerateItems}
                                        startIcon={<IconPlaylistAdd />}
                                        disabled={submitting}
                                        sx={{ mr: 2 }}
                                    >
                                        Generate Items
                                    </Button>
                                )}
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
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </MainCard>
    )
}

export default AccessReviewForm