/**
 * Visual Rebranding Module
 * Handles CSS styling and client-side visual modifications
 */

const { FLOWSTACK_COLORS } = require('../../config/brand-colors');

/**
 * Get custom CSS styles for rebranding
 * @returns {String} CSS styles
 */
function getStyles() {
    return `
    <style>
        /* FlowStack Brand Colors */
        :root {
            --flowstack-primary: ${FLOWSTACK_COLORS.primary};
            --flowstack-secondary: ${FLOWSTACK_COLORS.secondary};
            --flowstack-accent: ${FLOWSTACK_COLORS.accent};
            --flowstack-success: ${FLOWSTACK_COLORS.success};
            --flowstack-warning: ${FLOWSTACK_COLORS.warning};
            --flowstack-gradient-primary: ${FLOWSTACK_COLORS.gradients.primary};
            --flowstack-gradient-accent: ${FLOWSTACK_COLORS.gradients.accent};
        }
        
        /* Override Material UI Theme */
        body .MuiAppBar-root {
            background: var(--flowstack-gradient-primary) !important;
        }
        
        body .MuiButton-containedPrimary {
            background: var(--flowstack-primary) !important;
        }
        
        /* Logo replacements */
        img[src*="flowise_logo"],
        img[src*="flowise-logo"],
        img[alt*="Flowise"] {
            content: url('/assets/flowstack_logo.png');
            width: 50px !important;
            height: auto !important;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar-thumb {
            background: var(--flowstack-primary);
        }
        
        /* Loading states */
        body .MuiCircularProgress-colorPrimary {
            color: var(--flowstack-primary) !important;
        }
    </style>
    `;
}

/**
 * Get client-side scripts for visual modifications
 * @param {String} baseUrl - Base URL for API
 * @returns {String} JavaScript code
 */
function getScripts(baseUrl) {
    return `
    <script>
        // Configure API endpoints
        window.VITE_API_BASE_URL = '${baseUrl}';
        window.REACT_APP_BASE_URL = '${baseUrl}';
        window.localStorage.setItem('baseURL', '${baseUrl}');
        
        // Fix React deprecated prop warnings
        (function() {
            // Patch React.createElement to filter out deprecated props
            const originalCreateElement = window.React && window.React.createElement;
            if (originalCreateElement) {
                window.React.createElement = function(type, props, ...children) {
                    if (props && typeof type === 'string') {
                        // Remove deprecated MUI Dialog props and custom props that shouldn't be on DOM elements
                        const deprecatedProps = ['disableBackdropClick', 'onEscapeKeyDown', 'inputParam'];
                        const cleanProps = { ...props };
                        deprecatedProps.forEach(prop => {
                            delete cleanProps[prop];
                        });
                        return originalCreateElement.call(this, type, cleanProps, ...children);
                    }
                    return originalCreateElement.call(this, type, props, ...children);
                };
                // Copy static properties
                Object.assign(window.React.createElement, originalCreateElement);
            }
            
            // Alternative approach: wait for React to load and patch it
            const waitForReact = setInterval(() => {
                if (window.React && window.React.createElement && !window.React._flowstackPatched) {
                    const originalCreateElement = window.React.createElement;
                    window.React.createElement = function(type, props, ...children) {
                        if (props && typeof type === 'string') {
                            // Filter out props that shouldn't be on DOM elements
                            const { disableBackdropClick, onEscapeKeyDown, inputParam, ...cleanProps } = props;
                            return originalCreateElement.call(this, type, cleanProps, ...children);
                        }
                        return originalCreateElement.call(this, type, props, ...children);
                    };
                    Object.assign(window.React.createElement, originalCreateElement);
                    window.React._flowstackPatched = true;
                    clearInterval(waitForReact);
                }
            }, 100);
            
            // Clean up after 5 seconds if React never loads
            setTimeout(() => clearInterval(waitForReact), 5000);
        })();
        
        // Logo replacement function
        function replaceLogos() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.src && img.src.toLowerCase().includes('flowise')) {
                    img.src = '/assets/flowstack_logo.png';
                    img.alt = 'FlowStack';
                    img.style.width = '50px';
                    img.style.height = 'auto';
                }
            });
            
            // Update favicon
            let favicon = document.querySelector("link[rel*='icon']");
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = '/favicon.ico';
        }
        
        // Run immediately and on DOM changes
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', replaceLogos);
        } else {
            replaceLogos();
        }
        
        // Monitor for new images
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'IMG') {
                        replaceLogos();
                    }
                });
            });
        });
        
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    </script>
    `;
}

/**
 * Get logo replacement mapping
 * @returns {Object} Logo URL mappings
 */
function getLogoMappings() {
    return {
        '/assets/images/flowise_logo.png': '/assets/flowstack_logo.png',
        '/assets/images/flowise_logo_dark.png': '/assets/flowstack_logo.png',
        '/flowise_white.svg': '/assets/flowstack_logo.svg',
        '/flowise_dark.svg': '/assets/flowstack_logo.svg'
    };
}

module.exports = {
    visualRebranding: {
        getStyles,
        getScripts,
        getLogoMappings
    }
}; 