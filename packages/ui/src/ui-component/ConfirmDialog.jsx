import React from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material'

const ConfirmDialog = ({
    open,
    title,
    content,
    onConfirm,
    onCancel,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    confirmButtonProps = {},
    cancelButtonProps = {}
}) => {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary" {...cancelButtonProps}>
                    {cancelButtonText}
                </Button>
                <Button onClick={onConfirm} variant="contained" color="primary" {...confirmButtonProps}>
                    {confirmButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
    confirmButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object
}

export default ConfirmDialog 