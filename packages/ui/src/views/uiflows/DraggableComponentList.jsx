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
    Typography,
    Collapse,
    IconButton
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { IconSearch, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import MainCard from '@/ui-component/cards/MainCard'

// Component categories and definitions
export const COMPONENT_CATEGORIES = {
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
                },
                propertyTypes: {
                    direction: 'select',
                    justifyContent: 'select',
                    alignItems: 'select',
                    spacing: 'number'
                },
                propertyOptions: {
                    direction: [
                        { label: 'Row', value: 'row' },
                        { label: 'Column', value: 'column' },
                        { label: 'Row Reverse', value: 'row-reverse' },
                        { label: 'Column Reverse', value: 'column-reverse' }
                    ],
                    justifyContent: [
                        { label: 'Flex Start', value: 'flex-start' },
                        { label: 'Center', value: 'center' },
                        { label: 'Flex End', value: 'flex-end' },
                        { label: 'Space Between', value: 'space-between' },
                        { label: 'Space Around', value: 'space-around' }
                    ],
                    alignItems: [
                        { label: 'Flex Start', value: 'flex-start' },
                        { label: 'Center', value: 'center' },
                        { label: 'Flex End', value: 'flex-end' },
                        { label: 'Stretch', value: 'stretch' },
                        { label: 'Baseline', value: 'baseline' }
                    ]
                }
            },
            { 
                type: 'GridContainer', 
                label: 'Grid Container', 
                icon: '⯐',
                defaultProps: {
                    columns: 12,
                    spacing: 2
                },
                propertyTypes: {
                    columns: 'number',
                    spacing: 'number'
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
                },
                propertyTypes: {
                    label: 'string',
                    placeholder: 'string',
                    required: 'boolean',
                    fullWidth: 'boolean',
                    variant: 'select',
                    size: 'select'
                },
                propertyOptions: {
                    variant: [
                        { label: 'Outlined', value: 'outlined' },
                        { label: 'Filled', value: 'filled' },
                        { label: 'Standard', value: 'standard' }
                    ],
                    size: [
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' }
                    ]
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
                },
                propertyTypes: {
                    label: 'string',
                    variant: 'select',
                    color: 'select',
                    fullWidth: 'boolean',
                    disabled: 'boolean'
                },
                propertyOptions: {
                    variant: [
                        { label: 'Contained', value: 'contained' },
                        { label: 'Outlined', value: 'outlined' },
                        { label: 'Text', value: 'text' }
                    ],
                    color: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Success', value: 'success' },
                        { label: 'Error', value: 'error' },
                        { label: 'Info', value: 'info' },
                        { label: 'Warning', value: 'warning' }
                    ]
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
                },
                propertyTypes: {
                    label: 'string',
                    options: 'json',
                    variant: 'select',
                    required: 'boolean',
                    fullWidth: 'boolean'
                },
                propertyOptions: {
                    variant: [
                        { label: 'Outlined', value: 'outlined' },
                        { label: 'Filled', value: 'filled' },
                        { label: 'Standard', value: 'standard' }
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
                },
                propertyTypes: {
                    text: 'string',
                    variant: 'select',
                    align: 'select',
                    color: 'color'
                },
                propertyOptions: {
                    variant: [
                        { label: 'H1', value: 'h1' },
                        { label: 'H2', value: 'h2' },
                        { label: 'H3', value: 'h3' },
                        { label: 'H4', value: 'h4' },
                        { label: 'H5', value: 'h5' },
                        { label: 'H6', value: 'h6' },
                        { label: 'Subtitle 1', value: 'subtitle1' },
                        { label: 'Subtitle 2', value: 'subtitle2' },
                        { label: 'Body 1', value: 'body1' },
                        { label: 'Body 2', value: 'body2' },
                        { label: 'Caption', value: 'caption' }
                    ],
                    align: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                        { label: 'Justify', value: 'justify' }
                    ]
                }
            },
            { 
                type: 'ImageDisplay', 
                label: 'Image', 
                icon: '🖼',
                defaultProps: {
                    src: 'https://via.placeholder.com/150',
                    alt: 'Image'
                },
                propertyTypes: {
                    src: 'string',
                    alt: 'string',
                    width: 'string',
                    height: 'string',
                    borderRadius: 'string'
                }
            },
            { 
                type: 'CardDisplay', 
                label: 'Card', 
                icon: '🃏',
                defaultProps: {
                    title: 'Card Title',
                    content: 'Card content goes here'
                },
                propertyTypes: {
                    title: 'string',
                    content: 'string',
                    elevation: 'number',
                    variant: 'select',
                    background: 'color',
                    borderRadius: 'string'
                },
                propertyOptions: {
                    variant: [
                        { label: 'Outlined', value: 'outlined' },
                        { label: 'Elevation', value: 'elevation' }
                    ]
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
                },
                propertyTypes: {
                    label: 'string',
                    confirmText: 'string',
                    variant: 'select',
                    color: 'select',
                    fullWidth: 'boolean',
                    disabled: 'boolean'
                },
                propertyOptions: {
                    variant: [
                        { label: 'Contained', value: 'contained' },
                        { label: 'Outlined', value: 'outlined' },
                        { label: 'Text', value: 'text' }
                    ],
                    color: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Success', value: 'success' },
                        { label: 'Error', value: 'error' },
                        { label: 'Info', value: 'info' },
                        { label: 'Warning', value: 'warning' }
                    ]
                }
            }
        ]
    }
}

const DraggableComponentList = () => {
    const theme = useTheme()
    const [search, setSearch] = useState('')
    const [expandedCategories, setExpandedCategories] = useState(
        Object.keys(COMPONENT_CATEGORIES).reduce((acc, key) => {
            acc[key] = true
            return acc
        }, {})
    )
    
    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        })
    }
    
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
        event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
        event.dataTransfer.effectAllowed = 'move';
        
        // Add some visual feedback during drag
        if (event.dataTransfer.setDragImage && component.icon) {
            const el = document.createElement('div');
            el.style.width = '60px';
            el.style.height = '60px';
            el.style.borderRadius = '4px';
            el.style.backgroundColor = theme.palette.primary.light;
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontSize = '24px';
            el.style.color = theme.palette.primary.dark;
            el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            el.innerHTML = component.icon;
            
            document.body.appendChild(el);
            event.dataTransfer.setDragImage(el, 30, 30);
            
            // Clean up the element after dragging
            setTimeout(() => {
                document.body.removeChild(el);
            }, 0);
        }
    }
    
    return (
        <MainCard title="Components" contentSX={{ p: 0 }}>
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search components..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconSearch size={20} />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>
            
            <Divider />
                
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', py: 1 }}>
                    {Object.entries(filteredCategories).length > 0 ? (
                        Object.entries(filteredCategories).map(([key, category]) => (
                        <Box key={key}>
                            <ListItemButton 
                                onClick={() => toggleCategory(key)}
                                sx={{ 
                                    py: 1,
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? theme.palette.dark.main 
                                        : theme.palette.grey[100]
                                }}
                            >
                                <ListItemText 
                                    primary={
                                        <Typography variant="subtitle1" color="primary">
                                    {category.label}
                                </Typography>
                                    } 
                                />
                                <IconButton edge="end" size="small">
                                    {expandedCategories[key] ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                                </IconButton>
                            </ListItemButton>
                            
                            <Collapse in={expandedCategories[key]}>
                                <List disablePadding>
                                    {category.components.map((component) => (
                                        <ListItemButton
                                            key={component.type}
                                            sx={{
                                                py: 1.5,
                                                px: 3,
                                                cursor: 'grab',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.primary.light + '20'
                                                }
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
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 1,
                                                    backgroundColor: theme.palette.primary.light + '30',
                                                    color: theme.palette.primary.dark,
                                                    fontSize: '16px',
                                                    fontWeight: 'bold'
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
                                                    variant: 'caption',
                                                    color: 'textSecondary'
                                                }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                            <Divider />
                            </Box>
                        ))
                    ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="textSecondary">No components match your search.</Typography>
                    </Box>
                    )}
                </Box>
        </MainCard>
    )
}

// Expose the component categories for other components to use
DraggableComponentList.COMPONENT_CATEGORIES = COMPONENT_CATEGORIES

export default DraggableComponentList 