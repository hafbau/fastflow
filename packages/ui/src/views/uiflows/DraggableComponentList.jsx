import { useState } from 'react'

// material-ui
import {
    Box,
    Card,
    CardContent,
    Divider,
    InputAdornment,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { IconSearch } from '@tabler/icons-react'

// Component categories and definitions
const COMPONENT_CATEGORIES = {
    container: {
        label: 'Container',
        components: [
            { 
                type: 'FlexContainer', 
                label: 'Flex Container', 
                icon: '⬚',
                defaultProps: {
                    direction: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    spacing: 2
                }
            },
            { 
                type: 'GridContainer', 
                label: 'Grid Container', 
                icon: '⯐',
                defaultProps: {
                    columns: 12,
                    spacing: 2
                }
            }
        ]
    },
    form: {
        label: 'Form',
        components: [
            { 
                type: 'TextInput', 
                label: 'Text Input', 
                icon: '⌨',
                defaultProps: {
                    label: 'Input',
                    placeholder: 'Enter text...',
                    required: false
                }
            },
            { 
                type: 'Button', 
                label: 'Button', 
                icon: '⏵',
                defaultProps: {
                    label: 'Button',
                    variant: 'contained',
                    color: 'primary'
                }
            },
            { 
                type: 'SelectInput', 
                label: 'Select Input', 
                icon: '⌄',
                defaultProps: {
                    label: 'Select',
                    options: [
                        { value: 'option1', label: 'Option 1' },
                        { value: 'option2', label: 'Option 2' }
                    ]
                }
            }
        ]
    },
    display: {
        label: 'Display',
        components: [
            { 
                type: 'TextDisplay', 
                label: 'Text', 
                icon: 'T',
                defaultProps: {
                    text: 'Text content',
                    variant: 'body1'
                }
            },
            { 
                type: 'ImageDisplay', 
                label: 'Image', 
                icon: '🖼',
                defaultProps: {
                    src: 'https://via.placeholder.com/150',
                    alt: 'Image'
                }
            },
            { 
                type: 'CardDisplay', 
                label: 'Card', 
                icon: '🃏',
                defaultProps: {
                    title: 'Card Title',
                    content: 'Card content goes here'
                }
            }
        ]
    },
    action: {
        label: 'Action',
        components: [
            { 
                type: 'SubmitButton', 
                label: 'Submit Button', 
                icon: '✓',
                defaultProps: {
                    label: 'Submit',
                    confirmText: 'Are you sure?'
                }
            }
        ]
    }
}

const DraggableComponentList = () => {
    const theme = useTheme()
    const [search, setSearch] = useState('')
    
    // Filter components based on search term
    const filteredCategories = Object.entries(COMPONENT_CATEGORIES).reduce((acc, [key, category]) => {
        const filteredComponents = category.components.filter(comp => 
            comp.label.toLowerCase().includes(search.toLowerCase()) ||
            comp.type.toLowerCase().includes(search.toLowerCase())
        )
        
        if (filteredComponents.length > 0) {
            acc[key] = {
                ...category,
                components: filteredComponents
            }
        }
        
        return acc
    }, {})
    
    // Handle drag start event
    const onDragStart = (event, component) => {
        // Set drag data with component info
        event.dataTransfer.setData('application/reactflow', JSON.stringify(component))
        event.dataTransfer.effectAllowed = 'move'
    }
    
    return (
        <Card>
            <CardContent>
                <Typography variant="h4" gutterBottom>
                    Components
                </Typography>
                
                <TextField
                    fullWidth
                    placeholder="Search components..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconSearch />
                            </InputAdornment>
                        )
                    }}
                />
                
                <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {Object.entries(filteredCategories).length > 0 ? (
                        Object.entries(filteredCategories).map(([key, category]) => (
                            <Box key={key} sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
                                    {category.label}
                                </Typography>
                                
                                <List disablePadding>
                                    {category.components.map((component) => (
                                        <ListItemButton
                                            key={component.type}
                                            sx={{
                                                mb: 0.5,
                                                border: `1px solid ${theme.palette.grey[300]}`,
                                                borderRadius: 1,
                                                cursor: 'grab'
                                            }}
                                            draggable
                                            onDragStart={(event) => onDragStart(event, component)}
                                        >
                                            <ListItemIcon sx={{ 
                                                minWidth: 40, 
                                                '& .component-icon': {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: '4px',
                                                    backgroundColor: theme.palette.grey[100],
                                                    border: `1px solid ${theme.palette.grey[300]}`,
                                                    color: theme.palette.text.primary,
                                                    fontSize: '16px'
                                                }
                                            }}>
                                                <div className="component-icon">
                                                    {component.icon}
                                                </div>
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={component.label}
                                                secondary={component.type}
                                                primaryTypographyProps={{
                                                    variant: 'body1',
                                                    fontWeight: 500
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'body2',
                                                    color: 'textSecondary'
                                                }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Box>
                        ))
                    ) : (
                        <Typography color="textSecondary">No components match your search.</Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

export default DraggableComponentList 