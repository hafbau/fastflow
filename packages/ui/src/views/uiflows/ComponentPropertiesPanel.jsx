import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

// material-ui
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { gridSpacing } from '@/store/constant'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { IconChevronDown, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react'
import MainCard from '@/ui-component/cards/MainCard'
import { ColorPicker } from '@/ui-component/color-picker/ColorPicker'
import { CodeEditor } from '@/ui-component/editor/CodeEditor'

/**
 * Component Properties Panel
 * Displays and allows editing of a UI component's properties
 */
const ComponentPropertiesPanel = ({ component, onComponentUpdate, componentTypes }) => {
    const theme = useTheme()
    
    // Local state for component properties
    const [properties, setProperties] = useState({})
    
    // Update properties when component changes
    useEffect(() => {
        if (component?.component?.properties) {
            setProperties({...component.component.properties})
        }
    }, [component])
    
    // Handle property value change
    const handlePropertyChange = (propertyName, value) => {
        setProperties(prev => ({
            ...prev,
            [propertyName]: value
        }))
    }
    
    // Get UI component type from componentTypes array
    const getComponentType = () => {
        if (!component || !componentTypes) return null
        
        const categories = Object.values(componentTypes || {})
        for (const category of categories) {
            const comp = category.components.find(c => c.type === component.component?.type)
            if (comp) return comp
        }
        return null
    }
    
    // Get appropriate input component for property type
    const renderPropertyInput = (propertyName, propertyValue, propertyType, options) => {
        switch (propertyType) {
            case 'string':
                return (
                    <TextField
                        fullWidth
                        value={propertyValue || ''}
                        onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                        size="small"
                    />
                )
            case 'number':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        value={propertyValue || 0}
                        onChange={(e) => handlePropertyChange(propertyName, Number(e.target.value))}
                        size="small"
                    />
                )
            case 'boolean':
                return (
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={Boolean(propertyValue)}
                                    onChange={(e) => handlePropertyChange(propertyName, e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={propertyValue ? "True" : "False"}
                        />
                    </FormGroup>
                )
            case 'select':
                return (
                    <FormControl fullWidth size="small">
                        <Select
                            value={propertyValue || ''}
                            onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                        >
                            {options?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )
            case 'color':
                return (
                    <ColorPicker
                        value={propertyValue || '#000000'}
                        onChange={(color) => handlePropertyChange(propertyName, color)}
                    />
                )
            case 'json':
                return (
                    <Box sx={{ border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 1 }}>
                        <CodeEditor
                            value={typeof propertyValue === 'object' ? JSON.stringify(propertyValue, null, 2) : propertyValue || '{}'}
                            height="120px"
                            theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                            lang="json"
                            onValueChange={(code) => {
                                try {
                                    const jsonValue = JSON.parse(code)
                                    handlePropertyChange(propertyName, jsonValue)
                                } catch (e) {
                                    // Don't update on invalid JSON
                                    console.error('Invalid JSON', e)
                                }
                            }}
                        />
                    </Box>
                )
            default:
                return (
                    <TextField
                        fullWidth
                        value={propertyValue || ''}
                        onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                        size="small"
                    />
                )
        }
    }
    
    // Save changes back to the component
    const handleSave = () => {
        if (onComponentUpdate && component) {
            onComponentUpdate({
                ...component,
                component: {
                    ...component.component,
                    properties
                }
            })
        }
    }
    
    // Reset to original properties
    const handleReset = () => {
        if (component?.component?.properties) {
            setProperties({...component.component.properties})
        }
    }
    
    // If no component is selected
    if (!component) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                    Select a component to edit its properties
                </Typography>
            </Paper>
        )
    }
    
    // Get component type info
    const componentTypeInfo = getComponentType()
    
    return (
        <MainCard>
            <Stack spacing={gridSpacing}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4">{componentTypeInfo?.label || component.component?.type} Properties</Typography>
                        <Typography variant="caption" color="textSecondary">
                            ID: {component.id}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <StyledButton
                            variant="outlined"
                            startIcon={<IconRefresh />}
                            onClick={handleReset}
                            color="secondary"
                        >
                            Reset
                        </StyledButton>
                        <StyledButton
                            variant="contained"
                            startIcon={<IconDeviceFloppy />}
                            onClick={handleSave}
                        >
                            Save
                        </StyledButton>
                    </Stack>
                </Stack>
                
                <Divider />
                
                <Grid container spacing={2}>
                    {/* Display properties based on component type */}
                    {Object.entries(properties).map(([propName, propValue]) => (
                        <Grid item xs={12} key={propName}>
                            <Typography variant="subtitle2" gutterBottom>
                                {propName}
                            </Typography>
                            {renderPropertyInput(
                                propName,
                                propValue,
                                componentTypeInfo?.propertyTypes?.[propName] || guessPropertyType(propValue),
                                componentTypeInfo?.propertyOptions?.[propName]
                            )}
                        </Grid>
                    ))}
                    
                    {/* No properties message */}
                    {Object.keys(properties).length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary" align="center">
                                This component has no editable properties
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Stack>
        </MainCard>
    )
}

// Utility function to guess property type from value
const guessPropertyType = (value) => {
    if (typeof value === 'string') {
        // Check if it's a color
        if (/^#([0-9A-F]{3}){1,2}$/i.test(value) || /^rgb/i.test(value)) {
            return 'color'
        }
        return 'string'
    }
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'object') return 'json'
    return 'string' // Default
}

ComponentPropertiesPanel.propTypes = {
    component: PropTypes.object,
    onComponentUpdate: PropTypes.func,
    componentTypes: PropTypes.object
}

export default ComponentPropertiesPanel 