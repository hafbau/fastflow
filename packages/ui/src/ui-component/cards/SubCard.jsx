import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, Divider, Typography, useTheme } from '@mui/material';

const SubCard = ({ children, content, contentClass, darkTitle, secondary, sx = {}, title, ...others }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.200',
                ':hover': {
                    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
                },
                ...sx
            }}
            {...others}
        >
            {/* card header and action */}
            {!darkTitle && title && (
                <CardHeader
                    sx={{ p: 2.5 }}
                    title={<Typography variant="h5">{title}</Typography>}
                    action={secondary}
                />
            )}
            {darkTitle && title && (
                <CardHeader
                    sx={{ p: 2.5 }}
                    title={<Typography variant="h4">{title}</Typography>}
                    action={secondary}
                />
            )}

            {/* content & header divider */}
            {title && (
                <Divider
                    sx={{
                        opacity: 1,
                        borderColor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.200'
                    }}
                />
            )}

            {/* card content */}
            {content && (
                <CardContent sx={{ p: 2.5 }} className={contentClass || ''}>
                    {children}
                </CardContent>
            )}
            {!content && children}
        </Card>
    );
};

SubCard.propTypes = {
    children: PropTypes.node,
    content: PropTypes.bool,
    contentClass: PropTypes.string,
    darkTitle: PropTypes.bool,
    secondary: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
    sx: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object])
};

SubCard.defaultProps = {
    content: true
};

export default SubCard; 