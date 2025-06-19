/**
 * FlowStack Brand Colors Configuration
 * Centralized color definitions for consistent branding
 */

const FLOWSTACK_COLORS = {
    // Primary brand colors
    primary: '#2563eb',        // Royal Blue
    secondary: '#9e28b0',      // Mauveine
    accent: '#ff5524',         // Orange
    success: '#00bfd8',        // Moonstone
    warning: '#fbbc05',        // Amber
    
    // Neutral colors
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
    },
    
    // Gradients
    gradients: {
        primary: 'linear-gradient(135deg, #2563eb 0%, #9e28b0 100%)',
        accent: 'linear-gradient(135deg, #ff5524 0%, #fbbc05 100%)',
        cool: 'linear-gradient(135deg, #00bfd8 0%, #2563eb 100%)'
    }
};

module.exports = { FLOWSTACK_COLORS }; 