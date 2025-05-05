import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Business, SupervisorAccount } from '@mui/icons-material';

/**
 * Workspace card component
 * Displays a workspace card with basic information
 */
const WorkspaceCard = ({ workspace }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/organizations/${workspace.organization_id}/workspaces/${workspace.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {workspace.name}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={1}>
            <Business fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {workspace.organizationName}
            </Typography>
          </Box>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '40px',
            }}
          >
            {workspace.description || 'No description provided'}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <SupervisorAccount fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {workspace.memberCount || '—'}
              </Typography>
            </Box>
            
            <Chip
              size="small"
              label={workspace.role}
              color={workspace.role === 'admin' ? 'primary' : 'default'}
              variant={workspace.role === 'admin' ? 'filled' : 'outlined'}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

WorkspaceCard.propTypes = {
  workspace: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    organization_id: PropTypes.string.isRequired,
    organizationName: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    memberCount: PropTypes.number,
  }).isRequired,
};

export default WorkspaceCard;
