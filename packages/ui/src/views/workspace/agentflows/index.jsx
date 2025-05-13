import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Tooltip,
  Fab,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';

import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchWorkspaceAgentflows,
  createWorkspaceAgentflow,
  deleteWorkspaceAgentflow,
  exportWorkspaceAgentflow,
  importWorkspaceAgentflow,
  getWorkspaceAgentExecutions
} from '../../../api/workspace/agentflows';

/**
 * Agentflows workspace component
 * Displays and manages agentflows within a workspace
 */
const Agentflows = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { user, currentWorkspace } = useAuth();

  // State
  const [agentflows, setAgentflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentAgentflowId, setCurrentAgentflowId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [executionsDialogOpen, setExecutionsDialogOpen] = useState(false);
  const [executions, setExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load agentflows
  useEffect(() => {
    const loadAgentflows = async () => {
      try {
        setLoading(true);
        const data = await fetchWorkspaceAgentflows(workspaceId);
        setAgentflows(data);
      } catch (error) {
        console.error('Error loading agentflows:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load agentflows',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadAgentflows();
    }
  }, [workspaceId]);

  // Create new agentflow
  const handleCreateAgentflow = async () => {
    try {
      const newAgentflow = await createWorkspaceAgentflow(workspaceId, {
        name: 'New Agentflow',
        description: 'New agentflow description',
      });
      
      // Navigate to the agentflow editor
      navigate(`/workspaces/${workspaceId}/agentflows/${newAgentflow.id}/edit`);
    } catch (error) {
      console.error('Error creating agentflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create agentflow',
        severity: 'error'
      });
    }
  };

  // Handle agentflow click
  const handleAgentflowClick = (agentflowId) => {
    navigate(`/workspaces/${workspaceId}/agentflows/${agentflowId}/edit`);
  };

  // Handle menu open
  const handleMenuOpen = (event, agentflowId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentAgentflowId(agentflowId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentAgentflowId(null);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle delete agentflow
  const handleDeleteAgentflow = async () => {
    try {
      await deleteWorkspaceAgentflow(workspaceId, currentAgentflowId);
      setAgentflows(agentflows.filter(af => af.id !== currentAgentflowId));
      setSnackbar({
        open: true,
        message: 'Agentflow deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting agentflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete agentflow',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Handle export agentflow
  const handleExportAgentflow = async () => {
    try {
      const exportData = await exportWorkspaceAgentflow(workspaceId, currentAgentflowId);
      
      // Create and download the JSON file
      const agentflowName = agentflows.find(af => af.id === currentAgentflowId)?.name || 'agentflow';
      const fileName = `${agentflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      handleMenuClose();
      setSnackbar({
        open: true,
        message: 'Agentflow exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting agentflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export agentflow',
        severity: 'error'
      });
      handleMenuClose();
    }
  };

  // Handle import dialog open
  const handleImportDialogOpen = () => {
    setImportDialogOpen(true);
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setImportData(jsonData);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        setSnackbar({
          open: true,
          message: 'Invalid JSON file',
          severity: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle import agentflow
  const handleImportAgentflow = async () => {
    if (!importData) return;
    
    try {
      const importedAgentflow = await importWorkspaceAgentflow(workspaceId, importData);
      setAgentflows([...agentflows, importedAgentflow]);
      setSnackbar({
        open: true,
        message: 'Agentflow imported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error importing agentflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to import agentflow',
        severity: 'error'
      });
    } finally {
      setImportDialogOpen(false);
      setImportData(null);
      setImportFile(null);
    }
  };

  // Handle duplicate agentflow
  const handleDuplicateAgentflow = async () => {
    try {
      // First export the agentflow to get its data
      const exportData = await exportWorkspaceAgentflow(workspaceId, currentAgentflowId);
      
      // Modify the export data for the duplicate
      const originalName = agentflows.find(af => af.id === currentAgentflowId)?.name || 'Agentflow';
      exportData.name = `Copy of ${originalName}`;
      
      // Import the modified data as a new agentflow
      const importedAgentflow = await importWorkspaceAgentflow(workspaceId, exportData);
      setAgentflows([...agentflows, importedAgentflow]);
      
      setSnackbar({
        open: true,
        message: 'Agentflow duplicated successfully',
        severity: 'success'
      });
      handleMenuClose();
    } catch (error) {
      console.error('Error duplicating agentflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to duplicate agentflow',
        severity: 'error'
      });
      handleMenuClose();
    }
  };

  // Handle run agentflow
  const handleRunAgentflow = (agentflowId) => {
    navigate(`/workspaces/${workspaceId}/agentflows/${agentflowId}/run`);
  };

  // Handle view executions
  const handleViewExecutions = async () => {
    try {
      setExecutionsLoading(true);
      const data = await getWorkspaceAgentExecutions(workspaceId, currentAgentflowId);
      setExecutions(data);
      setExecutionsDialogOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error fetching executions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load execution history',
        severity: 'error'
      });
    } finally {
      setExecutionsLoading(false);
    }
  };

  // Filter agentflows by search query
  const filteredAgentflows = agentflows.filter(agentflow =>
    agentflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agentflow.description && agentflow.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Agentflows</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleImportDialogOpen}
          >
            Import
          </Button>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAgentflow}
          >
            Create Agentflow
          </Button>
        </Box>
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search agentflows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredAgentflows.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center', 
          mt: 8,
          p: 3,
          textAlign: 'center'
        }}>
          <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No agentflows found</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {searchQuery 
              ? 'No agentflows match your search criteria. Try a different query.'
              : 'Get started by creating your first agentflow.'
            }
          </Typography>
          {!searchQuery && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateAgentflow}
            >
              Create Agentflow
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAgentflows.map((agentflow) => (
            <Grid item xs={12} sm={6} md={4} key={agentflow.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 4px 20px 0 rgba(0,0,0,0.12)`,
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => handleAgentflowClick(agentflow.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }} title={agentflow.name}>
                        {agentflow.name}
                      </Typography>
                      {agentflow.isBeta && (
                        <Chip 
                          label="Beta" 
                          color="info" 
                          size="small" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      )}
                    </Box>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, agentflow.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ 
                    mt: 1, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '40px'
                  }}>
                    {agentflow.description || 'No description'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">
                    {agentflow.updatedAt ? `Updated ${new Date(agentflow.updatedAt).toLocaleDateString()}` : ''}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunAgentflow(agentflow.id);
                    }}
                  >
                    Run
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Agentflow Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDuplicateAgentflow}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleExportAgentflow}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <MenuItem onClick={handleViewExecutions}>
          <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
          Execution History
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Agentflow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this agentflow? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAgentflow} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          setImportData(null);
          setImportFile(null);
        }}
      >
        <DialogTitle>Import Agentflow</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select an agentflow JSON file to import.
          </DialogContentText>
          <Button
            variant="outlined"
            component="label"
          >
            Select File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleFileInputChange}
            />
          </Button>
          {importFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected file: {importFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setImportDialogOpen(false);
            setImportData(null);
            setImportFile(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleImportAgentflow}
            disabled={!importData}
            variant="contained"
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Executions Dialog */}
      <Dialog
        open={executionsDialogOpen}
        onClose={() => setExecutionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Execution History</DialogTitle>
        <DialogContent>
          {executionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : executions.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1">No execution history found for this agentflow.</Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {executions.map((execution) => (
                <Card key={execution.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">
                      Execution ID: {execution.id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Started: {new Date(execution.startTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: <Chip 
                        label={execution.status} 
                        color={execution.status === 'completed' ? 'success' : execution.status === 'failed' ? 'error' : 'warning'}
                        size="small" 
                      />
                    </Typography>
                    {execution.endTime && (
                      <Typography variant="body2" color="textSecondary">
                        Completed: {new Date(execution.endTime).toLocaleString()}
                      </Typography>
                    )}
                    {execution.error && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="error.dark">
                          Error: {execution.error}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small"
                      onClick={() => navigate(`/workspaces/${workspaceId}/agentflows/${currentAgentflowId}/executions/${execution.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add agentflow button for mobile */}
      <Tooltip title="Create Agentflow">
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={handleCreateAgentflow}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Agentflows;
