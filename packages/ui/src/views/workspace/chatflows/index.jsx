import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Stack,
  TextField,
  InputAdornment,
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
  Skeleton,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons 
import { 
  IconPlus, 
  IconSearch, 
  IconDownload, 
  IconTrash, 
  IconCopy,
  IconLayoutGrid,
  IconList
} from '@tabler/icons-react';

// Project imports
import MainCard from '@/ui-component/cards/MainCard';
import ItemCard from '@/ui-component/cards/ItemCard';
import { FlowListTable } from '@/ui-component/table/FlowListTable';
import { StyledButton } from '@/ui-component/button/StyledButton';
import ViewHeader from '@/layout/MainLayout/ViewHeader';
import WorkflowEmptySVG from '@/assets/images/workflow_empty.svg';
import { gridSpacing } from '@/store/constant';

// Contexts
import { useAuth } from '@/contexts/AuthContext';

// API
import chatflowsApi from '@/api/workspace/chatflows';
import { baseURL } from '@/store/constant';

/**
 * Chatflows component for workspace-scoped view
 * Shows all chatflows for the current workspace with ability to create, edit, delete
 */
const Chatflows = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { currentWorkspace } = useAuth();

  // State
  const [chatflows, setChatflows] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState(localStorage.getItem('flowDisplayStyle') || 'card');
  const [images, setImages] = useState({});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentChatflowId, setCurrentChatflowId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load chatflows
  useEffect(() => {
    const loadChatflows = async () => {
      try {
        setLoading(true);
        const data = await chatflowsApi.fetchWorkspaceChatflows(workspaceId);
        setChatflows(data);
        
        // Process images for each chatflow
        const images = {};
        for (let i = 0; i < data.length; i += 1) {
          const flowDataStr = data[i].flowData;
          if (flowDataStr) {
            try {
              const flowData = JSON.parse(flowDataStr);
              const nodes = flowData.nodes || [];
              images[data[i].id] = [];
              for (let j = 0; j < nodes.length; j += 1) {
                const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`;
                if (!images[data[i].id].includes(imageSrc)) {
                  images[data[i].id].push(imageSrc);
                }
              }
            } catch (e) {
              console.error('Error parsing flowData:', e);
            }
          }
        }
        setImages(images);
      } catch (error) {
        console.error('Error loading chatflows:', error);
        setError(error);
        setSnackbar({
          open: true,
          message: 'Failed to load chatflows',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadChatflows();
    }
  }, [workspaceId]);

  // Handle view toggle
  const handleViewChange = (event, nextView) => {
    if (nextView === null) return;
    localStorage.setItem('flowDisplayStyle', nextView);
    setView(nextView);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Filter flows by search query
  const filterFlows = (data) => {
    return (
      data.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
      (data.category && data.category.toLowerCase().indexOf(search.toLowerCase()) > -1) ||
      data.id.toLowerCase().indexOf(search.toLowerCase()) > -1
    );
  };

  // Create new chatflow
  const handleCreateChatflow = async () => {
    try {
      const newChatflow = await chatflowsApi.createWorkspaceChatflow(workspaceId, {
        name: 'New Chatflow',
        description: 'New chatflow description',
        type: 'CHATFLOW'
      });
      
      // Navigate to the chatflow editor
      navigate(`/workspaces/${workspaceId}/canvas/${newChatflow.id}`);
    } catch (error) {
      console.error('Error creating chatflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create chatflow',
        severity: 'error'
      });
    }
  };

  // Handle chatflow click
  const handleChatflowClick = (chatflowId) => {
    navigate(`/workspaces/${workspaceId}/canvas/${chatflowId}`);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (chatflowId) => {
    setCurrentChatflowId(chatflowId);
    setDeleteDialogOpen(true);
  };

  // Handle delete chatflow
  const handleDeleteChatflow = async () => {
    try {
      await chatflowsApi.deleteWorkspaceChatflow(workspaceId, currentChatflowId);
      setChatflows(chatflows.filter(cf => cf.id !== currentChatflowId));
      setSnackbar({
        open: true,
        message: 'Chatflow deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting chatflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete chatflow',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setCurrentChatflowId(null);
    }
  };

  // Handle export chatflow
  const handleExportChatflow = async (chatflowId) => {
    try {
      const exportData = await chatflowsApi.exportWorkspaceChatflow(workspaceId, chatflowId);
      
      // Create and download the JSON file
      const chatflowName = chatflows.find(cf => cf.id === chatflowId)?.name || 'chatflow';
      const fileName = `${chatflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
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
      
      setSnackbar({
        open: true,
        message: 'Chatflow exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting chatflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export chatflow',
        severity: 'error'
      });
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

  // Handle import chatflow
  const handleImportChatflow = async () => {
    if (!importData) return;
    
    try {
      const importedChatflow = await chatflowsApi.importWorkspaceChatflow(workspaceId, importData);
      
      // Process images for the new chatflow
      if (importedChatflow.flowData) {
        try {
          const flowData = JSON.parse(importedChatflow.flowData);
          const nodes = flowData.nodes || [];
          const newImages = { ...images };
          newImages[importedChatflow.id] = [];
          for (let j = 0; j < nodes.length; j += 1) {
            const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`;
            if (!newImages[importedChatflow.id].includes(imageSrc)) {
              newImages[importedChatflow.id].push(imageSrc);
            }
          }
          setImages(newImages);
        } catch (e) {
          console.error('Error parsing flowData:', e);
        }
      }
      
      setChatflows([...chatflows, importedChatflow]);
      setSnackbar({
        open: true,
        message: 'Chatflow imported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error importing chatflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to import chatflow',
        severity: 'error'
      });
    } finally {
      setImportDialogOpen(false);
      setImportData(null);
      setImportFile(null);
    }
  };

  // Handle duplicate chatflow
  const handleDuplicateChatflow = async (chatflowId) => {
    try {
      // First export the chatflow to get its data
      const exportData = await chatflowsApi.exportWorkspaceChatflow(workspaceId, chatflowId);
      
      // Modify the export data for the duplicate
      const originalName = chatflows.find(cf => cf.id === chatflowId)?.name || 'Chatflow';
      exportData.name = `Copy of ${originalName}`;
      
      // Import the modified data as a new chatflow
      const importedChatflow = await chatflowsApi.importWorkspaceChatflow(workspaceId, exportData);
      
      // Process images for the new chatflow
      if (importedChatflow.flowData) {
        try {
          const flowData = JSON.parse(importedChatflow.flowData);
          const nodes = flowData.nodes || [];
          const newImages = { ...images };
          newImages[importedChatflow.id] = [];
          for (let j = 0; j < nodes.length; j += 1) {
            const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`;
            if (!newImages[importedChatflow.id].includes(imageSrc)) {
              newImages[importedChatflow.id].push(imageSrc);
            }
          }
          setImages(newImages);
        } catch (e) {
          console.error('Error parsing flowData:', e);
        }
      }
      
      setChatflows([...chatflows, importedChatflow]);
      setSnackbar({
        open: true,
        message: 'Chatflow duplicated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error duplicating chatflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to duplicate chatflow',
        severity: 'error'
      });
    }
  };

  // Close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Get workspace name
  const workspaceName = currentWorkspace?.name || '';
  
  // Filtered chatflows based on search
  const filteredChatflows = chatflows.filter(filterFlows);

  return (
    <MainCard>
      {error ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error loading chatflows
          </Typography>
          <Typography variant="body1">
            {error.message || 'An unexpected error occurred'}
          </Typography>
        </Box>
      ) : (
        <Stack flexDirection='column' sx={{ gap: 3 }}>
          <ViewHeader 
            onSearchChange={handleSearchChange} 
            search={true} 
            searchPlaceholder='Search Name or Category' 
            title={`${workspaceName} Chatflows`}
          >
            <ToggleButtonGroup
              sx={{ borderRadius: 2, maxHeight: 40 }}
              value={view}
              color='primary'
              exclusive
              onChange={handleViewChange}
            >
              <ToggleButton
                sx={{
                  borderColor: theme.palette.grey[900] + 25,
                  borderRadius: 2,
                  color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                }}
                variant='contained'
                value='card'
                title='Card View'
              >
                <IconLayoutGrid />
              </ToggleButton>
              <ToggleButton
                sx={{
                  borderColor: theme.palette.grey[900] + 25,
                  borderRadius: 2,
                  color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                }}
                variant='contained'
                value='list'
                title='List View'
              >
                <IconList />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button 
              variant="outlined"
              startIcon={<IconDownload />}
              onClick={handleImportDialogOpen}
              sx={{ borderRadius: 2, height: 40 }}
            >
              Import
            </Button>
            <StyledButton 
              variant='contained' 
              onClick={handleCreateChatflow} 
              startIcon={<IconPlus />} 
              sx={{ borderRadius: 2, height: 40 }}
            >
              Add New
            </StyledButton>
          </ViewHeader>
          
          {(!view || view === 'card') ? (
            <>
              {isLoading ? (
                <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
                  <Skeleton variant='rounded' height={160} />
                  <Skeleton variant='rounded' height={160} />
                  <Skeleton variant='rounded' height={160} />
                </Box>
              ) : (
                <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
                  {filteredChatflows.map((data, index) => (
                    <ItemCard 
                      key={index} 
                      onClick={() => handleChatflowClick(data.id)} 
                      data={data} 
                      images={images[data.id]} 
                      onDelete={() => handleDeleteDialogOpen(data.id)}
                      onExport={() => handleExportChatflow(data.id)}
                      onDuplicate={() => handleDuplicateChatflow(data.id)}
                    />
                  ))}
                </Box>
              )}
            </>
          ) : (
            <FlowListTable
              data={chatflows}
              images={images}
              isLoading={isLoading}
              filterFunction={filterFlows}
              updateFlowsApi={{ request: () => {} }}
              setError={setError}
              onFlowClick={handleChatflowClick}
              onDeleteFlow={handleDeleteDialogOpen}
              onExportFlow={handleExportChatflow}
              onDuplicateFlow={handleDuplicateChatflow}
              workspaceId={workspaceId}
            />
          )}
          
          {!isLoading && filteredChatflows.length === 0 && (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
              <Box sx={{ p: 2, height: 'auto' }}>
                <img
                  style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                  src={WorkflowEmptySVG}
                  alt='No Chatflows'
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {search ? 'No chatflows match your search criteria' : 'No Chatflows Yet'}
              </Typography>
              {!search && (
                <StyledButton 
                  variant='contained' 
                  onClick={handleCreateChatflow} 
                  startIcon={<IconPlus />} 
                >
                  Create New Chatflow
                </StyledButton>
              )}
            </Stack>
          )}
        </Stack>
      )}
      
      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          setImportData(null);
          setImportFile(null);
        }}
      >
        <DialogTitle>Import Chatflow</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a chatflow JSON file to import.
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
            onClick={handleImportChatflow}
            disabled={!importData}
            variant="contained"
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCurrentChatflowId(null);
        }}
      >
        <DialogTitle>Delete Chatflow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this chatflow? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setCurrentChatflowId(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteChatflow} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mobile Add Button */}
      <Tooltip title="Create Chatflow">
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={handleCreateChatflow}
        >
          <IconPlus />
        </Fab>
      </Tooltip>
      
      {/* Snackbar */}
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
    </MainCard>
  );
};

export default Chatflows;