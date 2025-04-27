import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'
import { EventEnabledUINode } from '../base/EventEnabledUINode'

/**
 * Event Button Component with Queuing Support
 */
export class EventButton extends EventEnabledUINode {
    constructor() {
        super('eventButton', 'Event Button', 'Event Button that integrates with queuing system')
        this.setupEventQueuing()
        this.initProperties()
    }

    private initProperties(): void {
        if (!this.properties) this.properties = []
        
        // Add label property if it doesn't exist
        const labelProp = this.properties.find((p) => p.propertyName === 'label')
        if (!labelProp) {
            this.properties.push({
                propertyName: 'label',
                displayName: 'Label',
                defaultValue: 'Button',
                type: 'string'
            } as UINodeProperty)
        }

        // Add button variant property
        const variantProp = this.properties.find((p) => p.propertyName === 'variant')
        if (!variantProp) {
            this.properties.push({
                propertyName: 'variant',
                displayName: 'Variant',
                defaultValue: 'contained',
                options: [
                    { label: 'Contained', value: 'contained' },
                    { label: 'Outlined', value: 'outlined' },
                    { label: 'Text', value: 'text' }
                ],
                type: 'options'
            } as UINodeProperty)
        }

        // Add color property
        const colorProp = this.properties.find((p) => p.propertyName === 'color')
        if (!colorProp) {
            this.properties.push({
                propertyName: 'color',
                displayName: 'Color',
                defaultValue: 'primary',
                options: [
                    { label: 'Primary', value: 'primary' },
                    { label: 'Secondary', value: 'secondary' },
                    { label: 'Success', value: 'success' },
                    { label: 'Error', value: 'error' },
                    { label: 'Warning', value: 'warning' },
                    { label: 'Info', value: 'info' }
                ],
                type: 'options'
            } as UINodeProperty)
        }

        // Add size property
        const sizeProp = this.properties.find((p) => p.propertyName === 'size')
        if (!sizeProp) {
            this.properties.push({
                propertyName: 'size',
                displayName: 'Size',
                defaultValue: 'medium',
                options: [
                    { label: 'Small', value: 'small' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Large', value: 'large' }
                ],
                type: 'options'
            } as UINodeProperty)
        }

        // Add event name property
        const eventNameProp = this.properties.find((p) => p.propertyName === 'eventName')
        if (!eventNameProp) {
            this.properties.push({
                propertyName: 'eventName',
                displayName: 'Event Name',
                defaultValue: 'buttonClick',
                type: 'string'
            } as UINodeProperty)
        }

        // Add target property (can be used to specify component to update)
        const targetProp = this.properties.find((p) => p.propertyName === 'target')
        if (!targetProp) {
            this.properties.push({
                propertyName: 'target',
                displayName: 'Target Component ID',
                defaultValue: '',
                type: 'string'
            } as UINodeProperty)
        }

        // Add queue events toggle
        const queueEventsProp = this.properties.find((p) => p.propertyName === 'queueEvents')
        if (!queueEventsProp) {
            this.properties.push({
                propertyName: 'queueEvents',
                displayName: 'Queue Events',
                defaultValue: true,
                type: 'boolean'
            } as UINodeProperty)
        }
    }

    renderComponent(nodeData: INodeData, data: ICommonObject): string {
        const label = this.getPropertyValue('label', nodeData) || 'Button'
        const variant = this.getPropertyValue('variant', nodeData) || 'contained'
        const color = this.getPropertyValue('color', nodeData) || 'primary'
        const size = this.getPropertyValue('size', nodeData) || 'medium'
        const eventName = this.getPropertyValue('eventName', nodeData) || 'buttonClick'
        const target = this.getPropertyValue('target', nodeData) || ''
        const queueEvents = this.getPropertyValue('queueEvents', nodeData) || true

        const componentId = nodeData.id
        const flowId = nodeData.flowId

        // Generate button HTML
        return `
            <button 
                id="${componentId}" 
                class="flowise-button flowise-button-${variant} flowise-button-${color} flowise-button-${size}"
                data-component-id="${componentId}"
                data-flow-id="${flowId}"
                data-event-name="${eventName}"
                data-target="${target}"
                data-queue-events="${queueEvents}"
                onclick="handleButtonClick(this)"
            >${label}</button>
            <script>
                function handleButtonClick(button) {
                    const componentId = button.getAttribute('data-component-id');
                    const flowId = button.getAttribute('data-flow-id');
                    const eventName = button.getAttribute('data-event-name');
                    const target = button.getAttribute('data-target');
                    const queueEvents = button.getAttribute('data-queue-events') === 'true';
                    
                    // Create event payload
                    const eventData = {
                        componentId: componentId,
                        eventType: eventName,
                        timestamp: new Date().toISOString(),
                        payload: {
                            clicked: true,
                            target: target || null
                        }
                    };
                    
                    // Dispatch custom event for any listeners
                    const customEvent = new CustomEvent('flowiseComponentEvent', { 
                        detail: eventData 
                    });
                    document.dispatchEvent(customEvent);
                    
                    // Set button to loading state
                    button.disabled = true;
                    button.innerHTML = '<span class="loading-indicator"></span> Processing...';
                    
                    // Send to server
                    const endpoint = queueEvents 
                        ? \`/api/v1/uicomponentevents/queue/\${flowId}/\${componentId}\`
                        : \`/api/v1/uicomponentevents/\${flowId}/\${componentId}\`;
                    
                    fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            eventType: eventName,
                            payload: {
                                clicked: true,
                                target: target || null
                            }
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Reset button state
                        button.disabled = false;
                        button.innerHTML = '${label}';
                        
                        console.log('Event processed:', data);
                        
                        // If there was a response with updates, apply them
                        if (data && data.updates) {
                            applyComponentUpdates(data.updates);
                        }
                    })
                    .catch(error => {
                        console.error('Error processing event:', error);
                        button.disabled = false;
                        button.innerHTML = '${label}';
                    });
                }
                
                function applyComponentUpdates(updates) {
                    if (!updates || !Array.isArray(updates)) return;
                    
                    updates.forEach(update => {
                        const targetElement = document.getElementById(update.componentId);
                        if (!targetElement) return;
                        
                        // Apply the update based on type
                        switch (update.type) {
                            case 'content':
                                targetElement.innerHTML = update.value;
                                break;
                            case 'property':
                                targetElement.setAttribute(update.property, update.value);
                                break;
                            case 'style':
                                targetElement.style[update.property] = update.value;
                                break;
                            case 'class':
                                if (update.action === 'add') {
                                    targetElement.classList.add(update.value);
                                } else if (update.action === 'remove') {
                                    targetElement.classList.remove(update.value);
                                } else if (update.action === 'toggle') {
                                    targetElement.classList.toggle(update.value);
                                }
                                break;
                            default:
                                console.warn('Unknown update type:', update.type);
                        }
                    });
                }
            </script>
            <style>
                .flowise-button {
                    font-family: Arial, sans-serif;
                    font-weight: 500;
                    border-radius: 4px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
                    margin: 8px 0;
                    position: relative;
                }
                
                .flowise-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                /* Size variants */
                .flowise-button-small {
                    padding: 6px 16px;
                    font-size: 13px;
                }
                
                .flowise-button-medium {
                    padding: 8px 20px;
                    font-size: 14px;
                }
                
                .flowise-button-large {
                    padding: 10px 24px;
                    font-size: 16px;
                }
                
                /* Variant: Contained */
                .flowise-button-contained {
                    border: none;
                    color: white;
                }
                
                .flowise-button-contained.flowise-button-primary {
                    background-color: #1976d2;
                }
                
                .flowise-button-contained.flowise-button-primary:hover {
                    background-color: #1565c0;
                }
                
                .flowise-button-contained.flowise-button-secondary {
                    background-color: #9c27b0;
                }
                
                .flowise-button-contained.flowise-button-secondary:hover {
                    background-color: #7b1fa2;
                }
                
                .flowise-button-contained.flowise-button-success {
                    background-color: #2e7d32;
                }
                
                .flowise-button-contained.flowise-button-success:hover {
                    background-color: #1b5e20;
                }
                
                .flowise-button-contained.flowise-button-error {
                    background-color: #d32f2f;
                }
                
                .flowise-button-contained.flowise-button-error:hover {
                    background-color: #c62828;
                }
                
                .flowise-button-contained.flowise-button-warning {
                    background-color: #ed6c02;
                    color: rgba(0, 0, 0, 0.87);
                }
                
                .flowise-button-contained.flowise-button-warning:hover {
                    background-color: #e65100;
                }
                
                .flowise-button-contained.flowise-button-info {
                    background-color: #0288d1;
                }
                
                .flowise-button-contained.flowise-button-info:hover {
                    background-color: #01579b;
                }
                
                /* Variant: Outlined */
                .flowise-button-outlined {
                    background-color: transparent;
                }
                
                .flowise-button-outlined.flowise-button-primary {
                    border: 1px solid #1976d2;
                    color: #1976d2;
                }
                
                .flowise-button-outlined.flowise-button-primary:hover {
                    background-color: rgba(25, 118, 210, 0.04);
                }
                
                .flowise-button-outlined.flowise-button-secondary {
                    border: 1px solid #9c27b0;
                    color: #9c27b0;
                }
                
                .flowise-button-outlined.flowise-button-secondary:hover {
                    background-color: rgba(156, 39, 176, 0.04);
                }
                
                .flowise-button-outlined.flowise-button-success {
                    border: 1px solid #2e7d32;
                    color: #2e7d32;
                }
                
                .flowise-button-outlined.flowise-button-success:hover {
                    background-color: rgba(46, 125, 50, 0.04);
                }
                
                .flowise-button-outlined.flowise-button-error {
                    border: 1px solid #d32f2f;
                    color: #d32f2f;
                }
                
                .flowise-button-outlined.flowise-button-error:hover {
                    background-color: rgba(211, 47, 47, 0.04);
                }
                
                .flowise-button-outlined.flowise-button-warning {
                    border: 1px solid #ed6c02;
                    color: #ed6c02;
                }
                
                .flowise-button-outlined.flowise-button-warning:hover {
                    background-color: rgba(237, 108, 2, 0.04);
                }
                
                .flowise-button-outlined.flowise-button-info {
                    border: 1px solid #0288d1;
                    color: #0288d1;
                }
                
                .flowise-button-outlined.flowise-button-info:hover {
                    background-color: rgba(2, 136, 209, 0.04);
                }
                
                /* Variant: Text */
                .flowise-button-text {
                    background-color: transparent;
                    border: none;
                }
                
                .flowise-button-text.flowise-button-primary {
                    color: #1976d2;
                }
                
                .flowise-button-text.flowise-button-primary:hover {
                    background-color: rgba(25, 118, 210, 0.04);
                }
                
                .flowise-button-text.flowise-button-secondary {
                    color: #9c27b0;
                }
                
                .flowise-button-text.flowise-button-secondary:hover {
                    background-color: rgba(156, 39, 176, 0.04);
                }
                
                .flowise-button-text.flowise-button-success {
                    color: #2e7d32;
                }
                
                .flowise-button-text.flowise-button-success:hover {
                    background-color: rgba(46, 125, 50, 0.04);
                }
                
                .flowise-button-text.flowise-button-error {
                    color: #d32f2f;
                }
                
                .flowise-button-text.flowise-button-error:hover {
                    background-color: rgba(211, 47, 47, 0.04);
                }
                
                .flowise-button-text.flowise-button-warning {
                    color: #ed6c02;
                }
                
                .flowise-button-text.flowise-button-warning:hover {
                    background-color: rgba(237, 108, 2, 0.04);
                }
                
                .flowise-button-text.flowise-button-info {
                    color: #0288d1;
                }
                
                .flowise-button-text.flowise-button-info:hover {
                    background-color: rgba(2, 136, 209, 0.04);
                }
                
                /* Loading indicator */
                .loading-indicator {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 8px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* For outlined and text variants, adjust the loading indicator color */
                .flowise-button-outlined .loading-indicator,
                .flowise-button-text .loading-indicator {
                    border: 2px solid rgba(0, 0, 0, 0.2);
                    border-top-color: currentColor;
                }
            </style>
        `
    }
    
    handleEvent(event: UIEvent): void {
        console.log('EventButton received event:', event)
        // Handle incoming events here if needed
    }
    
    handleResponse(response: any): void {
        console.log('EventButton received response:', response)
        // Update component state based on response if needed
    }
} 