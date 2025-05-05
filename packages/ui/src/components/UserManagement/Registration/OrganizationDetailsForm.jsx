import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Organization details form for registration
 * Collects organization name, slug, and description
 */
const OrganizationDetailsForm = ({ formData, handleChange }) => {
  // Generate slug from organization name
  useEffect(() => {
    if (formData.organizationName && !formData.organizationSlug) {
      const slug = formData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Simulate the change event
      handleChange('organizationSlug')({ target: { value: slug } });
    }
  }, [formData.organizationName, formData.organizationSlug, handleChange]);

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
            value={formData.organizationName}
            onChange={handleChange('organizationName')}
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
            value={formData.organizationSlug}
            onChange={handleChange('organizationSlug')}
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
            value={formData.organizationDescription}
            onChange={handleChange('organizationDescription')}
            multiline
            rows={3}
            helperText="A brief description of your organization (optional)"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

OrganizationDetailsForm.propTypes = {
  formData: PropTypes.shape({
    organizationName: PropTypes.string.isRequired,
    organizationSlug: PropTypes.string.isRequired,
    organizationDescription: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default OrganizationDetailsForm;
