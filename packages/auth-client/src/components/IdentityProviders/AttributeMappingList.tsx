import React, { useState } from 'react'
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
    SelectChangeEvent
} from '@mui/material'
import { 
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { 
    IdentityProviderAttribute, 
    AttributeMappingType 
} from '../../types/identityProvider'
import api from '../../utils/api'

interface AttributeMappingListProps {
    providerId: string
    attributes: IdentityProviderAttribute[]
    onAttributesChanged: () => void
}

const AttributeMappingList: React.FC<AttributeMappingListProps> = ({ 
    providerId, 
    attributes, 
    onAttributesChanged 
}) => {
    const { enqueueSnackbar } = useSnackbar()
    
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [currentAttribute, setCurrentAttribute] = useState<Partial<IdentityProviderAttribute>>({
        sourceAttribute: '',
        mappingType: AttributeMappingType.CUSTOM,
        targetAttribute: '',
        required: false,
        enabled: true
    })
    const [isEditing, setIsEditing] = useState(false)
    
    const handleOpenDialog = (attribute?: IdentityProviderAttribute) => {
        if (attribute) {
            setCurrentAttribute(attribute)
            setIsEditing(true)
        } else {
            setCurrentAttribute({
                sourceAttribute: '',
                mappingType: AttributeMappingType.CUSTOM,
                targetAttribute: '',
                required: false,
                enabled: true
            })
            setIsEditing(false)
        }
        setDialogOpen(true)
    }
    
    const handleCloseDialog = () => {
        setDialogOpen(false)
    }
    
    const handleOpenDeleteDialog = (attribute: IdentityProviderAttribute) => {
        setCurrentAttribute(attribute)
        setDeleteDialogOpen(true)
    }
    
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false)
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<AttributeMappingType>) => {
        const { name, value } = e.target
        if (name) {
            setCurrentAttribute((prev) => ({ ...prev, [name]: value }))
        }
    }
    
    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setCurrentAttribute((prev) => ({ ...prev, [name]: checked }))
    }
    
    const handleSave = async () => {
        try {
            // Validate required fields
            if (!currentAttribute.sourceAttribute || !currentAttribute.mappingType) {
                enqueueSnackbar('Please fill in all required fields', { variant: 'error' })
                return
            }
            
            // For custom mapping type, target attribute is required
            if (currentAttribute.mappingType === AttributeMappingType.CUSTOM && !currentAttribute.targetAttribute) {
                enqueueSnackbar('Target attribute is required for custom mappings', { variant: 'error' })
                return
            }
            
            if (isEditing && currentAttribute.id) {
                // Update attribute
                await api.put(
                    `/api/v1/identity-providers/${providerId}/attributes/${currentAttribute.id}`, 
                    currentAttribute
                )
                enqueueSnackbar('Attribute mapping updated successfully', { variant: 'success' })
            } else {
                // Create attribute
                await api.post(
                    `/api/v1/identity-providers/${providerId}/attributes`, 
                    {
                        ...currentAttribute,
                        identityProviderId: providerId
                    }
                )
                enqueueSnackbar('Attribute mapping created successfully', { variant: 'success' })
            }
            
            // Refresh attributes
            onAttributesChanged()
            handleCloseDialog()
        } catch (error) {
            console.error('Error saving attribute mapping:', error)
            enqueueSnackbar('Failed to save attribute mapping', { variant: 'error' })
        }
    }
    
    const handleDelete = async () => {
        try {
            if (!currentAttribute.id) return
            
            // Delete attribute
            await api.delete(`/api/v1/identity-providers/${providerId}/attributes/${currentAttribute.id}`)
            enqueueSnackbar('Attribute mapping deleted successfully', { variant: 'success' })
            
            // Refresh attributes
            onAttributesChanged()
            handleCloseDeleteDialog()
        } catch (error) {
            console.error('Error deleting attribute mapping:', error)
            enqueueSnackbar('Failed to delete attribute mapping', { variant: 'error' })
        }
    }
    
    const getMappingTypeLabel = (type: AttributeMappingType) => {
        switch (type) {
            case AttributeMappingType.EMAIL:
                return 'Email'
            case AttributeMappingType.FULL_NAME:
                return 'Full Name'
            case AttributeMappingType.FIRST_NAME:
                return 'First Name'
            case AttributeMappingType.LAST_NAME:
                return 'Last Name'
            case AttributeMappingType.ROLE:
                return 'Role'
            case AttributeMappingType.ORGANIZATION:
                return 'Organization'
            case AttributeMappingType.WORKSPACE:
                return 'Workspace'
            case AttributeMappingType.CUSTOM:
                return 'Custom'
            default:
                return type
        }
    }
    
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    Attribute Mappings
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Mapping
                </Button>
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Source Attribute</TableCell>
                            <TableCell>Mapping Type</TableCell>
                            <TableCell>Target Attribute</TableCell>
                            <TableCell>Required</TableCell>
                            <TableCell>Enabled</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attributes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No attribute mappings configured
                                </TableCell>
                            </TableRow>
                        ) : (
                            attributes.map((attribute) => (
                                <TableRow key={attribute.id}>
                                    <TableCell>{attribute.sourceAttribute}</TableCell>
                                    <TableCell>{getMappingTypeLabel(attribute.mappingType)}</TableCell>
                                    <TableCell>{attribute.targetAttribute || '-'}</TableCell>
                                    <TableCell>{attribute.required ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{attribute.enabled ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(attribute)}
                                            title="Edit"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteDialog(attribute)}
                                            title="Delete"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Edit Attribute Mapping' : 'Add Attribute Mapping'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Source Attribute"
                                name="sourceAttribute"
                                value={currentAttribute.sourceAttribute || ''}
                                onChange={handleChange}
                                required
                                helperText="The attribute name from the identity provider"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="mapping-type-label">Mapping Type</InputLabel>
                                <Select
                                    labelId="mapping-type-label"
                                    name="mappingType"
                                    value={currentAttribute.mappingType || AttributeMappingType.CUSTOM}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value={AttributeMappingType.EMAIL}>Email</MenuItem>
                                    <MenuItem value={AttributeMappingType.FULL_NAME}>Full Name</MenuItem>
                                    <MenuItem value={AttributeMappingType.FIRST_NAME}>First Name</MenuItem>
                                    <MenuItem value={AttributeMappingType.LAST_NAME}>Last Name</MenuItem>
                                    <MenuItem value={AttributeMappingType.ROLE}>Role</MenuItem>
                                    <MenuItem value={AttributeMappingType.ORGANIZATION}>Organization</MenuItem>
                                    <MenuItem value={AttributeMappingType.WORKSPACE}>Workspace</MenuItem>
                                    <MenuItem value={AttributeMappingType.CUSTOM}>Custom</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {currentAttribute.mappingType === AttributeMappingType.CUSTOM && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Target Attribute"
                                    name="targetAttribute"
                                    value={currentAttribute.targetAttribute || ''}
                                    onChange={handleChange}
                                    required
                                    helperText="The attribute name in the user profile"
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={currentAttribute.required || false}
                                        onChange={handleSwitchChange}
                                        name="required"
                                    />
                                }
                                label="Required (authentication will fail if missing)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={currentAttribute.enabled || false}
                                        onChange={handleSwitchChange}
                                        name="enabled"
                                    />
                                }
                                label="Enabled"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary" startIcon={<SaveIcon />}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Attribute Mapping</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the attribute mapping for "{currentAttribute.sourceAttribute}"?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default AttributeMappingList