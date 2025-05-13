import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Organization details form for registration
 * Collects organization name, slug, and description
 */
const OrganizationDetailsForm = ({ formData, handleInputChange, handleBack, handleSubmit }) => {
  // Generate slug from organization name
  useEffect(() => {
    if (formData.organizationName && !formData.organizationSlug) {
      const slug = formData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Create a synthetic event
      const syntheticEvent = {
        target: {
          name: 'organizationSlug',
          value: slug
        }
      };
      
      handleInputChange(syntheticEvent);
    }
  }, [formData.organizationName, formData.organizationSlug, handleInputChange]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Organization Details
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Create your organization to get started.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="organizationName"
            name="organizationName"
            label="Organization Name"
            value={formData.organizationName || ''}
            onChange={handleInputChange}
            helperText="The name of your company or team"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="organizationSlug"
            name="organizationSlug"
            label="Organization URL"
            value={formData.organizationSlug || ''}
            onChange={handleInputChange}
            helperText="Used in your organization's URL (only lowercase letters, numbers, and hyphens)"
            InputProps={{
              startAdornment: <Box component="span" sx={{ color: 'text.secondary' }}>flowstack.io/</Box>,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="organizationDescription"
            name="organizationDescription"
            label="Organization Description"
            value={formData.organizationDescription || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
            helperText="A brief description of your organization (optional)"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

OrganizationDetailsForm.propTypes = {
  formData: PropTypes.shape({
    organizationName: PropTypes.string,
    organizationSlug: PropTypes.string,
    organizationDescription: PropTypes.string,
  }),
  handleInputChange: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default OrganizationDetailsForm;
