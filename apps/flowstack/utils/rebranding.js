/**
 * Rebranding Utilities
 */

const { REBRAND, PORT } = require('../config');

/**
 * Rebrand text content
 * @param {string} text - Text to rebrand
 * @returns {string} - Rebranded text
 */
function rebrandText(text) {
    let result = text;
    Object.entries(REBRAND).forEach(([original, replacement]) => {
        // Use global regex for replacements
        const regex = new RegExp(original, 'g');
        result = result.replace(regex, replacement);
    });
    return result;
}

/**
 * Get custom branding CSS and scripts
 * @param {string} baseUrl - The base URL for the proxy
 * @returns {string} - HTML string with custom branding
 */
function getCustomBranding(baseUrl = '') {
    // If no baseUrl provided, use the configured port
    const proxyUrl = baseUrl || `http://localhost:${PORT}`;
    
    return `
        <script>
            // Override API URL to use proxy
            window.VITE_API_BASE_URL = '${proxyUrl}';
            window.REACT_APP_BASE_URL = '${proxyUrl}';
            window.localStorage.setItem('baseURL', '${proxyUrl}');
            
            // Override the base URL directly on window for immediate effect
            Object.defineProperty(window, 'baseURL', {
                value: '${proxyUrl}',
                writable: false,
                configurable: false
            });
            
            // Debug logging
            console.log('[FlowStack] API URL configured:', window.VITE_API_BASE_URL);
        </script>
        <style>
            /* FlowStack Custom Color Palette */
            :root {
                /* Primary Brand Colors */
                --flowstack-mauveine: #9e28b0;
                --flowstack-orange: #ff5524;
                --flowstack-amber: #fbbc05;
                --flowstack-moonstone: #00bfd8;
                --flowstack-royal-blue: #2563eb;
                
                /* Semantic Colors */
                --flowstack-primary: #2563eb;        /* Royal Blue - Primary actions */
                --flowstack-secondary: #9e28b0;      /* Mauveine - Secondary elements */
                --flowstack-accent: #ff5524;         /* Orange - CTAs and highlights */
                --flowstack-success: #00bfd8;       /* Moonstone - Success states */
                --flowstack-warning: #fbbc05;       /* Amber - Warnings */
                
                /* Gradient Combinations */
                --flowstack-gradient-primary: linear-gradient(135deg, #2563eb 0%, #9e28b0 100%);
                --flowstack-gradient-accent: linear-gradient(135deg, #ff5524 0%, #fbbc05 100%);
                --flowstack-gradient-cool: linear-gradient(135deg, #00bfd8 0%, #2563eb 100%);
                
                /* Neutral Shades */
                --flowstack-gray-50: #f9fafb;
                --flowstack-gray-100: #f3f4f6;
                --flowstack-gray-900: #111827;
            }
            
            /* Override Material UI Theme Colors */
            .MuiAppBar-root {
                background: var(--flowstack-gradient-primary) !important;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2) !important;
            }
            
            /* Primary buttons */
            .MuiButton-containedPrimary {
                background: var(--flowstack-primary) !important;
                &:hover {
                    background: var(--flowstack-secondary) !important;
                }
            }
            
            /* Secondary buttons */
            .MuiButton-containedSecondary {
                background: var(--flowstack-accent) !important;
            }
            
            /* Links and text */
            a, .MuiLink-root {
                color: var(--flowstack-primary) !important;
            }
            
            /* Sidebar navigation */
            .MuiDrawer-paper {
                background: linear-gradient(180deg, var(--flowstack-gray-50) 0%, white 100%) !important;
            }
            
            /* Selected menu items */
            .MuiListItem-root.Mui-selected {
                background: rgba(37, 99, 235, 0.08) !important;
                border-left: 3px solid var(--flowstack-primary) !important;
            }
            
            /* Cards and Paper components */
            .MuiPaper-root {
                transition: all 0.3s ease !important;
            }
            
            .MuiCard-root:hover {
                box-shadow: 0 8px 24px rgba(37, 99, 235, 0.1) !important;
                transform: translateY(-2px);
            }
            
            /* Chips and Tags */
            .MuiChip-root {
                background: var(--flowstack-gray-100) !important;
                &.MuiChip-colorPrimary {
                    background: rgba(37, 99, 235, 0.1) !important;
                    color: var(--flowstack-primary) !important;
                }
            }
            
            /* Success/Error/Warning states */
            .MuiAlert-standardSuccess {
                background: rgba(0, 191, 216, 0.1) !important;
                color: var(--flowstack-success) !important;
            }
            
            .MuiAlert-standardWarning {
                background: rgba(251, 188, 5, 0.1) !important;
                color: var(--flowstack-warning) !important;
            }
            
            /* Replace Flowise logos with FlowStack logo */
            img[src*="flowise_logo"],
            img[src*="flowise-logo"] {
                content: url('/assets/flowstack_logo.png');
            }
            
            /* Also handle background images */
            [style*="flowise_logo"] {
                background-image: url('/assets/flowstack_logo.png') !important;
            }
            
            /* Loading states */
            .MuiCircularProgress-colorPrimary {
                color: var(--flowstack-primary) !important;
            }
            
            /* Fab buttons */
            .MuiFab-primary {
                background: var(--flowstack-gradient-accent) !important;
                box-shadow: 0 4px 20px rgba(255, 85, 36, 0.3) !important;
            }
            
            /* Input fields focus state */
            .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
                border-color: var(--flowstack-primary) !important;
            }
            
            /* Tables */
            .MuiTableHead-root {
                background: var(--flowstack-gray-50) !important;
            }
            
            .MuiTableRow-root:hover {
                background: rgba(37, 99, 235, 0.04) !important;
            }
            
            /* Dialogs */
            .MuiDialog-paper {
                border-top: 3px solid var(--flowstack-primary) !important;
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: var(--flowstack-gray-100);
            }
            
            ::-webkit-scrollbar-thumb {
                background: var(--flowstack-primary);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: var(--flowstack-secondary);
            }
            
            /* Attribution footer with new colors */
            body::after {
                content: 'Powered by FlowStack | Built on Flowise';
                position: fixed;
                bottom: 10px;
                right: 10px;
                font-size: 11px;
                color: var(--flowstack-gray-900);
                z-index: 1000;
                background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(243,244,246,0.95) 100%);
                padding: 5px 10px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
                border: 1px solid rgba(37, 99, 235, 0.1);
            }
            
            /* Loading skeleton with brand colors */
            .MuiSkeleton-root {
                background: linear-gradient(90deg, 
                    var(--flowstack-gray-100) 0%, 
                    rgba(37, 99, 235, 0.05) 50%, 
                    var(--flowstack-gray-100) 100%
                ) !important;
            }
            
            /* Tooltips */
            .MuiTooltip-tooltip {
                background: var(--flowstack-gray-900) !important;
            }
        </style>
    `;
}

module.exports = {
    rebrandText,
    getCustomBranding
}; 