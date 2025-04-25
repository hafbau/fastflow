import PropTypes from 'prop-types'
import { useState } from 'react'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Paper, IconButton } from '@mui/material'
import { IconPencil, IconTrash, IconCopy, IconSettings } from '@tabler/icons-react'

// project imports
import { Handle, Position } from 'reactflow'

const UIComponentNode = ({ data, selected }) => {
    const theme = useTheme()
    const [isHovered, setIsHovered] = useState(false)
    
    const handleDelete = () => {
        // TODO: Implement delete functionality
        console.log('Delete component', data.id)
    }
    
    const handleDuplicate = () => {
        // TODO: Implement duplicate functionality
        console.log('Duplicate component', data.id)
    }
    
    const handleEdit = () => {
        // TODO: Implement edit functionality
        console.log('Edit component', data.id)
    }
    
    return (
        <Paper
            elevation={selected ? 3 : 1}
            sx={{
                minWidth: 150,
                maxWidth: 300,
                padding: 1.5,
                borderRadius: 1,
                border: `2px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
                backgroundColor: theme.palette.background.paper,
                position: 'relative',
                overflow: 'visible'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Handles for connection lines */}
            <Handle
                type="target"
                position={Position.Top}
                style={{ visibility: 'hidden' }}
                isConnectable={false}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ visibility: 'hidden' }}
                isConnectable={false}
            />
            
            {/* Component header with type and controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" color="primary">
                    {data.component.type}
                </Typography>
                
                {/* Action buttons - only shown on hover or select */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        opacity: isHovered || selected ? 1 : 0,
                        transition: 'opacity 0.2s',
                        '& > button': {
                            padding: 0.5,
                            marginLeft: 0.5,
                            fontSize: '0.8rem'
                        }
                    }}
                >
                    <IconButton size="small" onClick={handleEdit} title="Edit">
                        <IconPencil size={18} />
                    </IconButton>
                    <IconButton size="small" onClick={handleDuplicate} title="Duplicate">
                        <IconCopy size={18} />
                    </IconButton>
                    <IconButton size="small" onClick={handleDelete} title="Delete">
                        <IconTrash size={18} />
                    </IconButton>
                </Box>
            </Box>
            
            {/* Component ID */}
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                ID: {data.id}
            </Typography>
            
            {/* Component preview/content */}
            <Box 
                sx={{ 
                    p: 1, 
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 40,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}
            >
                <Typography variant="body2">
                    {data.component.properties?.label || data.component.properties?.text || data.label || 'UI Component'}
                </Typography>
            </Box>
            
            {/* Component properties summary */}
            {Object.keys(data.component.properties || {}).length > 0 && (
                <Box sx={{ mt: 1, fontSize: '0.75rem' }}>
                    <Typography variant="caption" fontWeight="bold">
                        Properties:
                    </Typography>
                    <Box 
                        sx={{ 
                            mt: 0.5,
                            maxHeight: 80,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                            p: 0.5,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
                            borderRadius: 0.5,
                            wordBreak: 'break-word'
                        }}
                    >
                        {Object.entries(data.component.properties).map(([key, value]) => (
                            <div key={key}>
                                <b>{key}:</b> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </div>
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    )
}

UIComponentNode.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.bool
}

UIComponentNode.defaultProps = {
    selected: false
}

export default UIComponentNode 