import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';

/**
 * Custom hook for showing notifications
 * @returns {Object} Object containing notification functions
 */
export const useNotifier = () => {
    const dispatch = useDispatch();

    /**
     * Show a success notification
     * @param {string} message Message to display
     */
    const notifySuccess = (message) => {
        dispatch(
            openSnackbar({
                open: true,
                message,
                variant: 'alert',
                alert: {
                    color: 'success'
                }
            })
        );
    };

    /**
     * Show an error notification
     * @param {string} message Message to display
     */
    const notifyError = (message) => {
        dispatch(
            openSnackbar({
                open: true,
                message,
                variant: 'alert',
                alert: {
                    color: 'error'
                }
            })
        );
    };

    /**
     * Show a warning notification
     * @param {string} message Message to display
     */
    const notifyWarning = (message) => {
        dispatch(
            openSnackbar({
                open: true,
                message,
                variant: 'alert',
                alert: {
                    color: 'warning'
                }
            })
        );
    };

    /**
     * Show an info notification
     * @param {string} message Message to display
     */
    const notifyInfo = (message) => {
        dispatch(
            openSnackbar({
                open: true,
                message,
                variant: 'alert',
                alert: {
                    color: 'info'
                }
            })
        );
    };

    return {
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo
    };
};

export default useNotifier;
