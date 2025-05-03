import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    open: false,
    message: '',
    variant: 'default',
    alert: {
        color: 'primary',
        severity: 'info'
    },
    close: true,
    anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right'
    },
    transition: 'SlideUp'
};

const snackbarSlice = createSlice({
    name: 'snackbar',
    initialState,
    reducers: {
        openSnackbar: (state, action) => {
            const { open, message, variant, alert, close, anchorOrigin, transition } = action.payload;
            
            state.open = open || initialState.open;
            state.message = message || initialState.message;
            state.variant = variant || initialState.variant;
            state.alert = {
                color: alert?.color || initialState.alert.color,
                severity: alert?.severity || initialState.alert.severity
            };
            state.close = close === undefined ? initialState.close : close;
            state.anchorOrigin = anchorOrigin || initialState.anchorOrigin;
            state.transition = transition || initialState.transition;
        },
        closeSnackbar: (state) => {
            state.open = false;
        }
    }
});

export const { openSnackbar, closeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer; 