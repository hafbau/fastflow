import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

// Project imports
import NavGroup from '../../layout/MainLayout/Sidebar/MenuList/NavGroup';
import workspaceDashboard from '../../menu-items/workspace-dashboard';

/**
 * WorkspaceMenuList Component
 * 
 * Renders workspace-specific navigation items, replacing the :workspaceId placeholder
 * in URLs with the actual workspace ID from the route parameters.
 */
const WorkspaceMenuList = () => {
  const { workspaceId } = useParams();
  
  // Create a processed version of menu items with workspaceId inserted into URLs
  const processedItems = {
    ...workspaceDashboard,
    children: workspaceDashboard.children.map(item => ({
      ...item,
      url: item.url.replace(':workspaceId', workspaceId)
    }))
  };
  
  return <NavGroup key={processedItems.id} item={processedItems} />;
};

WorkspaceMenuList.propTypes = {
  // No props needed as it gets workspaceId from route params
};

export default WorkspaceMenuList;
