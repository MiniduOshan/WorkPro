/**
 * Utility to trigger global UI alerts (toasts)
 */
export const toast = {
    error: (message, duration = 6000) => {
        window.dispatchEvent(new CustomEvent('global-alert', {
            detail: { message, type: 'error', duration }
        }));
    },
    success: (message, duration = 4000) => {
        window.dispatchEvent(new CustomEvent('global-alert', {
            detail: { message, type: 'success', duration }
        }));
    },
    warning: (message, duration = 5000) => {
        window.dispatchEvent(new CustomEvent('global-alert', {
            detail: { message, type: 'warning', duration }
        }));
    }
};

export default toast;
