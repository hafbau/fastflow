import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper
} from '@mui/material';
import { SentimentDissatisfied as NotFoundIcon } from '@mui/icons-material';

/**
 * 404 Not Found Page
 * Displayed when a user navigates to a non-existent route
 */
const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 5,
          mt: 6,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <NotFoundIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 3 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404: Page Not Found
        </Typography>
        
        <Typography variant="h6" color="textSecondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/dashboard"
            size="large"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
