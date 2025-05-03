import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@mui/material'
import { IconCheck, IconX, IconLock, IconUserOff } from '@tabler/icons-react'

const ReviewActionDialog = ({ open, onClose, item, actionType, onSubmit, submitting }) => {
    const [formData, setFormData] = useState({
        reviewItemId: '',
        actionType: '',
        comments: '',
        applyImmediately: true
    })

    useEffect(() => {
        if (item && actionType) {
            setFormData({
                reviewItemId: item.id,
                actionType,
                comments: '',
                applyImmediately: true
            })
        }
    }, [item, actionType])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleRadioChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value === 'true'
        })
    }

    const handleSubmit = () => {
        onSubmit(formData)
    }

    const getActionTitle = () => {
        switch (actionType) {
            case 'approve':
                return 'Approve Access'
            case 'reject':
                return 'Reject Access'
            case 'revoke_access':
                return 'Revoke Access'
            case 'deactivate_user':
                return 'Deactivate User'
            default:
                return 'Review Action'
        }
    }

    const getActionIcon = () => {
        switch (actionType) {
            case 'approve':
                return <IconCheck color="success" size={24} />
            case 'reject':
                return <IconX color="error" size={24} />
            case 'revoke_access':
                return <IconLock color="warning" size={24} />
            case 'deactivate_user':
                return <IconUserOff color="secondary" size={24} />
            default:
                return null
        }
    }

    const getActionDescription = () => {
        switch (actionType) {
            case 'approve':
                return 'Approving this access will maintain the current permissions for this user.'
            case 'reject':
                return 'Rejecting this access will flag it for removal but will not immediately remove the access.'
            case 'revoke_access':
                return 'Revoking access will immediately remove this permission from the user if "Apply immediately" is selected.'
            case 'deactivate_user':
                return 'Deactivating this user will prevent them from logging in and accessing any resources.'
            default:
                return ''
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                {getActionIcon()}
                <Typography variant="h3" component="span" sx={{ ml: 1 }}>
                    {getActionTitle()}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom>
                            {getActionDescription()}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Item Details:
                        </Typography>
                        <Typography variant="body2">
                            <strong>User:</strong> {item?.userId}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Type:</strong> {item?.type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Typography>
                        {item?.type === 'user_role' && (
                            <Typography variant="body2">
                                <strong>Role:</strong> {item?.metadata?.roleName || item?.roleId}
                            </Typography>
                        )}
                        {item?.type === 'resource_permission' && (
                            <Typography variant="body2">
                                <strong>Permission:</strong> {item?.resourceType}: {item?.permission}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="Add any comments or justification for this action"
                        />
                    </Grid>

                    {(actionType === 'revoke_access' || actionType === 'deactivate_user') && (
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <Typography variant="subtitle2" gutterBottom>
                                    Apply Changes:
                                </Typography>
                                <RadioGroup
                                    row
                                    name="applyImmediately"
                                    value={formData.applyImmediately.toString()}
                                    onChange={handleRadioChange}
                                >
                                    <FormControlLabel
                                        value="true"
                                        control={<Radio />}
                                        label="Apply immediately"
                                    />
                                    <FormControlLabel
                                        value="false"
                                        control={<Radio />}
                                        label="Flag for later action"
                                    />
                                </RadioGroup>
                                <FormHelperText>
                                    {formData.applyImmediately
                                        ? 'Changes will be applied immediately to the system'
                                        : 'Changes will be flagged for later implementation'}
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color={
                        actionType === 'approve'
                            ? 'success'
                            : actionType === 'reject' || actionType === 'revoke_access'
                            ? 'error'
                            : 'primary'
                    }
                    disabled={submitting}
                >
                    {submitting ? 'Submitting...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

ReviewActionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    item: PropTypes.object,
    actionType: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool
}

export default ReviewActionDialog