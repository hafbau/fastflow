import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// TabPanel component for the attribute tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attribute-tabpanel-${index}`}
      aria-labelledby={`attribute-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// AttributeManager component
const AttributeManager = ({ resourceType, resourceId, userId, organizationId, workspaceId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [attributes, setAttributes] = useState([]);
  const [attributeType, setAttributeType] = useState('resource');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState({
    key: '',
    value: '',
    type: 'string'
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    switch (newValue) {
      case 0:
        setAttributeType('resource');
        break;
      case 1:
        setAttributeType('user');
        break;
      case 2:
        setAttributeType('environment');
        break;
      default:
        setAttributeType('resource');
    }
    
    fetchAttributes(newValue);
  };

  // Fetch attributes based on the selected tab
  const fetchAttributes = async (tabIndex) => {
    setLoading(true);
    try {
      let response;
      
      switch (tabIndex) {
        case 0: // Resource attributes
          if (!resourceType || !resourceId) {
            setAttributes([]);
            return;
          }
          response = await axios.get(`/api/permissions/attributes/resource/${resourceType}/${resourceId}`);
          break;
        case 1: // User attributes
          if (!userId) {
            setAttributes([]);
            return;
          }
          response = await axios.get(`/api/permissions/attributes/user/${userId}`);
          break;
        case 2: // Environment attributes
          const orgParam = organizationId ? `organizationId=${organizationId}` : '';
          const wsParam = workspaceId ? `workspaceId=${workspaceId}` : '';
          const queryParams = [orgParam, wsParam].filter(Boolean).join('&');
          response = await axios.get(`/api/permissions/attributes/environment?${queryParams}`);
          break;
        default:
          setAttributes([]);
          return;
      }
      
      // Convert object to array of key-value pairs
      const attributesArray = Object.entries(response.data).map(([key, value]) => ({
        key,
        value,
        type: typeof value
      }));
      
      setAttributes(attributesArray);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      enqueueSnackbar('Failed to fetch attributes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchAttributes(tabValue);
  }, [resourceType, resourceId, userId, organizationId, workspaceId]);

  // Handle dialog open for adding a new attribute
  const handleAddAttribute = () => {
    setEditMode(false);
    setCurrentAttribute({
      key: '',
      value: '',
      type: 'string'
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing an attribute
  const handleEditAttribute = (attribute) => {
    setEditMode(true);
    setCurrentAttribute({
      ...attribute
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle attribute value change based on type
  const handleValueChange = (e) => {
    const { value } = e.target;
    let parsedValue = value;
    
    // Parse value based on type
    if (currentAttribute.type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (currentAttribute.type === 'boolean') {
      parsedValue = value === 'true';
    } else if (currentAttribute.type === 'object' || currentAttribute.type === 'array') {
      try {
        parsedValue = JSON.parse(value);
      } catch (error) {
        // Keep as string if not valid JSON
        parsedValue = value;
      }
    }
    
    setCurrentAttribute({
      ...currentAttribute,
      value: parsedValue
    });
  };

  // Save attribute
  const handleSaveAttribute = async () => {
    try {
      const { key, value } = currentAttribute;
      
      if (!key) {
        enqueueSnackbar('Attribute key is required', { variant: 'error' });
        return;
      }
      
      let endpoint;
      let payload;
      
      switch (attributeType) {
        case 'resource':
          if (!resourceType || !resourceId) {
            enqueueSnackbar('Resource type and ID are required', { variant: 'error' });
            return;
          }
          endpoint = `/api/permissions/attributes/resource/${resourceType}/${resourceId}`;
          payload = { key, value };
          break;
        case 'user':
          if (!userId) {
            enqueueSnackbar('User ID is required', { variant: 'error' });
            return;
          }
          endpoint = `/api/permissions/attributes/user/${userId}`;
          payload = { key, value };
          break;
        case 'environment':
          endpoint = '/api/permissions/attributes/environment';
          payload = { 
            key, 
            value,
            organizationId,
            workspaceId
          };
          break;
        default:
          enqueueSnackbar('Invalid attribute type', { variant: 'error' });
          return;
      }
      
      await axios.post(endpoint, payload);
      
      enqueueSnackbar(`Attribute ${editMode ? 'updated' : 'added'} successfully`, { variant: 'success' });
      handleCloseDialog();
      fetchAttributes(tabValue);
    } catch (error) {
      console.error('Error saving attribute:', error);
      enqueueSnackbar('Failed to save attribute', { variant: 'error' });
    }
  };

  // Delete attribute
  const handleDeleteAttribute = async (key) => {
    try {
      let endpoint;
      
      switch (attributeType) {
        case 'resource':
          if (!resourceType || !resourceId) {
            enqueueSnackbar('Resource type and ID are required', { variant: 'error' });
            return;
          }
          endpoint = `/api/permissions/attributes/resource/${resourceType}/${resourceId}/${key}`;
          break;
        case 'user':
          if (!userId) {
            enqueueSnackbar('User ID is required', { variant: 'error' });
            return;
          }
          endpoint = `/api/permissions/attributes/user/${userId}/${key}`;
          break;
        case 'environment':
          const orgParam = organizationId ? `organizationId=${organizationId}` : '';
          const wsParam = workspaceId ? `workspaceId=${workspaceId}` : '';
          const queryParams = [orgParam, wsParam].filter(Boolean).join('&');
          endpoint = `/api/permissions/attributes/environment/${key}?${queryParams}`;
          break;
        default:
          enqueueSnackbar('Invalid attribute type', { variant: 'error' });
          return;
      }
      
      await axios.delete(endpoint);
      
      enqueueSnackbar('Attribute deleted successfully', { variant: 'success' });
      fetchAttributes(tabValue);
    } catch (error) {
      console.error('Error deleting attribute:', error);
      enqueueSnackbar('Failed to delete attribute', { variant: 'error' });
    }
  };

  // Render attribute value based on type
  const renderAttributeValue = (attribute) => {
    const { value, type } = attribute;
    
    if (type === 'object' || type === 'array') {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }
    
    return String(value);
  };

  return (
    <Card>
      <CardHeader title="Attribute Management" />
      <Divider />
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="attribute tabs">
            <Tab label="Resource Attributes" disabled={!resourceType || !resourceId} />
            <Tab label="User Attributes" disabled={!userId} />
            <Tab label="Environment Attributes" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Resource Attributes</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAttribute}
              disabled={!resourceType || !resourceId}
            >
              Add Attribute
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No attributes found
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attribute) => (
                    <TableRow key={attribute.key}>
                      <TableCell>{attribute.key}</TableCell>
                      <TableCell>{renderAttributeValue(attribute)}</TableCell>
                      <TableCell>{attribute.type}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditAttribute(attribute)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteAttribute(attribute.key)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">User Attributes</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAttribute}
              disabled={!userId}
            >
              Add Attribute
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No attributes found
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attribute) => (
                    <TableRow key={attribute.key}>
                      <TableCell>{attribute.key}</TableCell>
                      <TableCell>{renderAttributeValue(attribute)}</TableCell>
                      <TableCell>{attribute.type}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditAttribute(attribute)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteAttribute(attribute.key)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Environment Attributes</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAttribute}
            >
              Add Attribute
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No attributes found
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attribute) => (
                    <TableRow key={attribute.key}>
                      <TableCell>{attribute.key}</TableCell>
                      <TableCell>{renderAttributeValue(attribute)}</TableCell>
                      <TableCell>{attribute.type}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditAttribute(attribute)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteAttribute(attribute.key)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </CardContent>
      
      {/* Add/Edit Attribute Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {editMode
              ? 'Edit the attribute details below.'
              : 'Enter the attribute details below.'}
          </DialogContentText>
          
          <TextField
            margin="dense"
            label="Key"
            fullWidth
            value={currentAttribute.key}
            onChange={(e) => setCurrentAttribute({ ...currentAttribute, key: e.target.value })}
            disabled={editMode} // Can't change key in edit mode
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={currentAttribute.type}
              onChange={(e) => setCurrentAttribute({ ...currentAttribute, type: e.target.value })}
            >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="object">Object</MenuItem>
              <MenuItem value="array">Array</MenuItem>
            </Select>
          </FormControl>
          
          {currentAttribute.type === 'boolean' ? (
            <FormControl fullWidth margin="dense">
              <InputLabel>Value</InputLabel>
              <Select
                value={String(currentAttribute.value)}
                onChange={handleValueChange}
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
            </FormControl>
          ) : currentAttribute.type === 'object' || currentAttribute.type === 'array' ? (
            <TextField
              margin="dense"
              label="Value (JSON)"
              fullWidth
              multiline
              rows={4}
              value={typeof currentAttribute.value === 'object' 
                ? JSON.stringify(currentAttribute.value, null, 2) 
                : currentAttribute.value}
              onChange={handleValueChange}
            />
          ) : (
            <TextField
              margin="dense"
              label="Value"
              fullWidth
              value={currentAttribute.value}
              onChange={handleValueChange}
              type={currentAttribute.type === 'number' ? 'number' : 'text'}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAttribute} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AttributeManager;