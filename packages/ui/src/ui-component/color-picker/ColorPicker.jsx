import { useState } from 'react'
import PropTypes from 'prop-types'
import { SketchPicker } from 'react-color'
import { Box, Popover, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconPalette } from '@tabler/icons-react'

/**
 * ColorPicker component
 * Uses react-color's SketchPicker inside a popover
 */
export const ColorPicker = ({ value, onChange, disabled = false }) => {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState(null)
    const [currentColor, setCurrentColor] = useState(value || '#000000')
    
    const handleClick = (event) => {
        if (!disabled) {
            setAnchorEl(event.currentTarget)
        }
    }
    
    const handleClose = () => {
        setAnchorEl(null)
    }
    
    const handleChange = (color) => {
        setCurrentColor(color.hex)
    }
    
    const handleChangeComplete = (color) => {
        if (onChange) {
            onChange(color.hex)
        }
        setCurrentColor(color.hex)
    }
    
    const open = Boolean(anchorEl)
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Color preview box */}
            <Box
                sx={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: currentColor,
                    cursor: disabled ? 'default' : 'pointer',
                    '&:hover': {
                        borderColor: disabled ? theme.palette.divider : theme.palette.primary.main
                    }
                }}
                onClick={handleClick}
            />
            
            {/* Color selector button */}
            <IconButton 
                size="small" 
                onClick={handleClick} 
                sx={{ ml: 1 }}
                disabled={disabled}
            >
                <IconPalette size={20} />
            </IconButton>
            
            {/* Color picker popover */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <SketchPicker 
                    color={currentColor}
                    onChange={handleChange}
                    onChangeComplete={handleChangeComplete}
                />
            </Popover>
        </Box>
    )
}

ColorPicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool
}

export default ColorPicker 