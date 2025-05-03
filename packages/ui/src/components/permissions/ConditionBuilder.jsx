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
  TextField,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Expression operators
const COMPARISON_OPERATORS = [
  { value: 'eq', label: 'Equals (=)' },
  { value: 'neq', label: 'Not Equals (≠)' },
  { value: 'gt', label: 'Greater Than (>)' },
  { value: 'gte', label: 'Greater Than or Equal (≥)' },
  { value: 'lt', label: 'Less Than (<)' },
  { value: 'lte', label: 'Less Than or Equal (≤)' },
  { value: 'in', label: 'In (∈)' },
  { value: 'not_in', label: 'Not In (∉)' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
];

const LOGICAL_OPERATORS = [
  { value: 'and', label: 'AND' },
  { value: 'or', label: 'OR' },
  { value: 'not', label: 'NOT' },
];

const ATTRIBUTE_TYPES = [
  { value: 'resource', label: 'Resource Attribute' },
  { value: 'user', label: 'User Attribute' },
  { value: 'environment', label: 'Environment Attribute' },
  { value: 'context', label: 'Context Value' },
];

// ConditionBuilder component
const ConditionBuilder = ({
  value,
  onChange,
  resourceType,
  resourceId,
  userId,
  organizationId,
  workspaceId,
  readOnly = false,
}) => {
  const [expression, setExpression] = useState(value || {
    type: 'condition',
    operator: 'eq',
    left: { type: 'attribute', attributeType: 'resource', attributeKey: '' },
    right: ''
  });
  
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [jsonValue, setJsonValue] = useState('');
  const [availableAttributes, setAvailableAttributes] = useState({
    resource: [],
    user: [],
    environment: []
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // Initialize component
  useEffect(() => {
    if (value) {
      setExpression(value);
    }
    
    // Fetch available attributes
    fetchAttributes();
  }, [value, resourceType, resourceId, userId, organizationId, workspaceId]);

  // Fetch attributes for autocomplete
  const fetchAttributes = async () => {
    try {
      // Fetch resource attributes if resourceType and resourceId are provided
      if (resourceType && resourceId) {
        const resourceResponse = await axios.get(`/api/permissions/attributes/resource/${resourceType}/${resourceId}`);
        setAvailableAttributes(prev => ({
          ...prev,
          resource: Object.keys(resourceResponse.data || {})
        }));
      }
      
      // Fetch user attributes if userId is provided
      if (userId) {
        const userResponse = await axios.get(`/api/permissions/attributes/user/${userId}`);
        setAvailableAttributes(prev => ({
          ...prev,
          user: Object.keys(userResponse.data || {})
        }));
      }
      
      // Fetch environment attributes
      const orgParam = organizationId ? `organizationId=${organizationId}` : '';
      const wsParam = workspaceId ? `workspaceId=${workspaceId}` : '';
      const queryParams = [orgParam, wsParam].filter(Boolean).join('&');
      const envResponse = await axios.get(`/api/permissions/attributes/environment?${queryParams}`);
      setAvailableAttributes(prev => ({
        ...prev,
        environment: Object.keys(envResponse.data || {})
      }));
    } catch (error) {
      console.error('Error fetching attributes:', error);
      enqueueSnackbar('Failed to fetch attributes', { variant: 'error' });
    }
  };

  // Handle expression change
  const handleExpressionChange = (newExpression) => {
    setExpression(newExpression);
    if (onChange) {
      onChange(newExpression);
    }
  };

  // Handle operator change
  const handleOperatorChange = (e) => {
    const newOperator = e.target.value;
    
    // Handle logical operators differently
    if (['and', 'or', 'not'].includes(newOperator)) {
      const newExpression = {
        type: 'composite',
        operator: newOperator,
        expressions: newOperator === 'not' ? [expression] : [expression, { type: 'condition', operator: 'eq', left: '', right: '' }]
      };
      handleExpressionChange(newExpression);
    } else {
      handleExpressionChange({
        ...expression,
        operator: newOperator
      });
    }
  };

  // Handle left operand change
  const handleLeftChange = (e, field) => {
    const value = e.target.value;
    
    if (field === 'attributeType') {
      handleExpressionChange({
        ...expression,
        left: {
          ...expression.left,
          attributeType: value,
          attributeKey: ''
        }
      });
    } else if (field === 'attributeKey') {
      handleExpressionChange({
        ...expression,
        left: {
          ...expression.left,
          attributeKey: value
        }
      });
    } else {
      handleExpressionChange({
        ...expression,
        left: value
      });
    }
  };

  // Handle right operand change
  const handleRightChange = (e) => {
    const value = e.target.value;
    handleExpressionChange({
      ...expression,
      right: value
    });
  };

  // Handle sub-expression change for composite expressions
  const handleSubExpressionChange = (index, newSubExpression) => {
    if (expression.type !== 'composite') return;
    
    const newExpressions = [...expression.expressions];
    newExpressions[index] = newSubExpression;
    
    handleExpressionChange({
      ...expression,
      expressions: newExpressions
    });
  };

  // Add a sub-expression to a composite expression
  const handleAddSubExpression = () => {
    if (expression.type !== 'composite') return;
    
    const newExpressions = [...expression.expressions, {
      type: 'condition',
      operator: 'eq',
      left: { type: 'attribute', attributeType: 'resource', attributeKey: '' },
      right: ''
    }];
    
    handleExpressionChange({
      ...expression,
      expressions: newExpressions
    });
  };

  // Remove a sub-expression from a composite expression
  const handleRemoveSubExpression = (index) => {
    if (expression.type !== 'composite') return;
    
    const newExpressions = [...expression.expressions];
    newExpressions.splice(index, 1);
    
    // If only one expression left in NOT, convert back to simple condition
    if (expression.operator === 'not' && newExpressions.length === 0) {
      handleExpressionChange({
        type: 'condition',
        operator: 'eq',
        left: { type: 'attribute', attributeType: 'resource', attributeKey: '' },
        right: ''
      });
      return;
    }
    
    // If only one expression left in AND/OR, convert back to that expression
    if (['and', 'or'].includes(expression.operator) && newExpressions.length === 1) {
      handleExpressionChange(newExpressions[0]);
      return;
    }
    
    handleExpressionChange({
      ...expression,
      expressions: newExpressions
    });
  };

  // Open JSON editor dialog
  const handleOpenJsonDialog = () => {
    setJsonValue(JSON.stringify(expression, null, 2));
    setShowJsonDialog(true);
  };

  // Close JSON editor dialog
  const handleCloseJsonDialog = () => {
    setShowJsonDialog(false);
  };

  // Save JSON from dialog
  const handleSaveJson = () => {
    try {
      const parsedJson = JSON.parse(jsonValue);
      handleExpressionChange(parsedJson);
      setShowJsonDialog(false);
      enqueueSnackbar('Expression updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Invalid JSON format', { variant: 'error' });
    }
  };

  // Render a simple condition expression
  const renderConditionExpression = () => {
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          {typeof expression.left === 'object' && expression.left?.type === 'attribute' ? (
            <Box>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Attribute Type</InputLabel>
                <Select
                  value={expression.left.attributeType || 'resource'}
                  onChange={(e) => handleLeftChange(e, 'attributeType')}
                  disabled={readOnly}
                >
                  {ATTRIBUTE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Attribute Key</InputLabel>
                <Select
                  value={expression.left.attributeKey || ''}
                  onChange={(e) => handleLeftChange(e, 'attributeKey')}
                  disabled={readOnly}
                >
                  {availableAttributes[expression.left.attributeType]?.map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                  <MenuItem value="__custom">
                    <em>Custom Key...</em>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {expression.left.attributeKey === '__custom' && (
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Custom Attribute Key"
                  value={expression.left.customKey || ''}
                  onChange={(e) => handleLeftChange({
                    target: {
                      value: e.target.value
                    }
                  }, 'attributeKey')}
                  disabled={readOnly}
                />
              )}
            </Box>
          ) : (
            <TextField
              fullWidth
              size="small"
              margin="dense"
              label="Left Operand"
              value={expression.left || ''}
              onChange={handleLeftChange}
              disabled={readOnly}
            />
          )}
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Operator</InputLabel>
            <Select
              value={expression.operator || 'eq'}
              onChange={handleOperatorChange}
              disabled={readOnly}
            >
              <Divider textAlign="left">Comparison</Divider>
              {COMPARISON_OPERATORS.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
              <Divider textAlign="left">Logical</Divider>
              {LOGICAL_OPERATORS.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Right Operand"
            value={expression.right || ''}
            onChange={handleRightChange}
            disabled={readOnly}
          />
        </Grid>
      </Grid>
    );
  };

  // Render a composite expression (AND, OR, NOT)
  const renderCompositeExpression = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {expression.operator === 'and' ? 'All of the following:' :
             expression.operator === 'or' ? 'Any of the following:' :
             'None of the following:'}
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={expression.operator}
              onChange={handleOperatorChange}
              disabled={readOnly}
            >
              {LOGICAL_OPERATORS.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {!readOnly && (
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddSubExpression}
              sx={{ ml: 2 }}
              disabled={expression.operator === 'not' && expression.expressions.length >= 1}
            >
              Add Condition
            </Button>
          )}
        </Box>
        
        {expression.expressions.map((subExpr, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
            {!readOnly && (
              <IconButton
                size="small"
                color="error"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => handleRemoveSubExpression(index)}
              >
                <DeleteIcon />
              </IconButton>
            )}
            
            <Box sx={{ mt: 2 }}>
              {subExpr.type === 'composite' ? (
                <ConditionBuilder
                  value={subExpr}
                  onChange={(newExpr) => handleSubExpressionChange(index, newExpr)}
                  resourceType={resourceType}
                  resourceId={resourceId}
                  userId={userId}
                  organizationId={organizationId}
                  workspaceId={workspaceId}
                  readOnly={readOnly}
                />
              ) : (
                <ConditionBuilder
                  value={subExpr}
                  onChange={(newExpr) => handleSubExpressionChange(index, newExpr)}
                  resourceType={resourceType}
                  resourceId={resourceId}
                  userId={userId}
                  organizationId={organizationId}
                  workspaceId={workspaceId}
                  readOnly={readOnly}
                />
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {!readOnly && (
          <Button
            startIcon={<CodeIcon />}
            onClick={handleOpenJsonDialog}
            color="secondary"
          >
            Edit JSON
          </Button>
        )}
      </Box>
      
      {expression.type === 'composite' ? renderCompositeExpression() : renderConditionExpression()}
      
      {/* JSON Editor Dialog */}
      <Dialog open={showJsonDialog} onClose={handleCloseJsonDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Expression JSON</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edit the expression JSON directly. Be careful to maintain valid JSON format.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={10}
            margin="dense"
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJsonDialog}>Cancel</Button>
          <Button onClick={handleSaveJson} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConditionBuilder;