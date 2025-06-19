/**
 * Text Rebranding Module
 * Handles all text-based content replacement
 */

const REPLACEMENTS = {
    // Direct replacements
    'Flowise': 'FlowStack',
    'flowise': 'flowstack',
    'FLOWISE': 'FLOWSTACK',
    
    // Domain replacements
    'flowiseai.com': 'getflowstack.ai',
    'flowiseai\\.com': 'getflowstack.ai',
    
    // GitHub references
    'github.com/FlowiseAI/Flowise': 'flowstack.com/docs',
    
    // Common phrases
    'Build LLM Apps Easily': 'Build AI Agents, Visually',
    'Drag & drop UI to build your customized LLM flow': 'Visual AI workflow builder for enterprise teams',
    
    // Error messages
    'flowise server': 'application server',
    'flowise ui': 'user interface',
    'Flowise Server': 'Application Server',
    'Flowise UI': 'User Interface'
};

// Compile regex patterns for performance
const REGEX_PATTERNS = Object.entries(REPLACEMENTS).map(([from, to]) => ({
    pattern: new RegExp(from, 'g'),
    replacement: to
}));

/**
 * Process text content for rebranding
 * @param {String} text - Text to rebrand
 * @returns {String} Rebranded text
 */
function process(text) {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // Apply all replacements
    for (const { pattern, replacement } of REGEX_PATTERNS) {
        result = result.replace(pattern, replacement);
    }
    
    return result;
}

/**
 * Process JSON content recursively
 * @param {*} obj - Object to process
 * @returns {*} Processed object
 */
function processJSON(obj) {
    if (typeof obj === 'string') {
        return process(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => processJSON(item));
    }
    
    if (obj && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            // Process both key and value
            const newKey = process(key);
            result[newKey] = processJSON(value);
        }
        return result;
    }
    
    return obj;
}

/**
 * Get replacement patterns for external use
 * @returns {Object} Replacement patterns
 */
function getPatterns() {
    return { ...REPLACEMENTS };
}

module.exports = {
    textRebranding: {
        process,
        processJSON,
        getPatterns
    }
}; 