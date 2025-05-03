import React from 'react';
import { Box, Container, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import { ResourcePermissionManager } from '../components/ResourcePermissions';

/**
 * Resource Detail Page Example
 * 
 * This example shows how to integrate the ResourcePermissionManager component
 * into a resource detail page with tabs for different sections.
 */
const ResourceDetailPage = () => {
  const [tabValue, setTabValue] = React.useState(0);

  // Example resource data
  const resource = {
    id: 'flow-123',
    type: 'chatflow',
    name: 'Customer Support Bot',
    description: 'A chatbot for handling customer support inquiries',
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-04-29T14:22:00Z',
    createdBy: 'user-456'
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {resource.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {resource.description}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="resource tabs">
            <Tab label="Details" id="tab-0" />
            <Tab label="Configuration" id="tab-1" />
            <Tab label="Permissions" id="tab-2" />
            <Tab label="History" id="tab-3" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Resource Information</Typography>
                <Box sx={{ mt: 2 }}>
                  <InfoRow label="ID" value={resource.id} />
                  <InfoRow label="Type" value={resource.type} />
                  <InfoRow label="Created" value={new Date(resource.createdAt).toLocaleString()} />
                  <InfoRow label="Last Updated" value={new Date(resource.updatedAt).toLocaleString()} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Usage Statistics</Typography>
                <Box sx={{ mt: 2 }}>
                  <InfoRow label="Total Executions" value="1,245" />
                  <InfoRow label="Average Response Time" value="320ms" />
                  <InfoRow label="Success Rate" value="98.7%" />
                  <InfoRow label="Last Execution" value="2 hours ago" />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Configuration Settings</Typography>
            <Typography>Configuration settings would go here...</Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Resource Permission Manager Integration */}
          <ResourcePermissionManager 
            resourceType={resource.type}
            resourceId={resource.id}
            resourceName={resource.name}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Version History</Typography>
            <Typography>Version history would go here...</Typography>
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
};

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Info Row Component for displaying key-value pairs
function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold', width: '40%' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ width: '60%' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default ResourceDetailPage;