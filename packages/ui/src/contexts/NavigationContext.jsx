import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Navigation context for managing application navigation state
 * Tracks current navigation level (app/workspace) and controls sidebar visibility
 */
const NavigationContext = createContext(null);

export const NAV_LEVELS = {
  APP: 'app',
  WORKSPACE: 'workspace',
};

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const { currentWorkspace } = useAuth();
  
  // State for tracking current navigation level
  const [currentNavLevel, setCurrentNavLevel] = useState(NAV_LEVELS.APP);
  
  // State for controlling sidebar visibility
  const [appSidebarVisible, setAppSidebarVisible] = useState(true);
  const [workspaceSidebarVisible, setWorkspaceSidebarVisible] = useState(true);
  
  // Track whether we're in mobile view
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 960);

  // Update navigation level based on the current route
  useEffect(() => {
    const path = location.pathname;
    
    // Check if we're in a workspace route
    if (path.startsWith('/workspaces/') && currentWorkspace) {
      setCurrentNavLevel(NAV_LEVELS.WORKSPACE);
    } else {
      setCurrentNavLevel(NAV_LEVELS.APP);
    }
  }, [location.pathname, currentWorkspace]);

  // Listen for window resize to determine mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 960;
      setIsMobileView(mobile);
      
      // Automatically close sidebars in mobile view
      if (mobile) {
        setAppSidebarVisible(false);
        setWorkspaceSidebarVisible(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle app sidebar visibility
  const toggleAppSidebar = () => {
    setAppSidebarVisible(prev => !prev);
  };

  // Toggle workspace sidebar visibility
  const toggleWorkspaceSidebar = () => {
    setWorkspaceSidebarVisible(prev => !prev);
  };

  // Set specific sidebar visibility
  const setSidebarVisibility = (level, visible) => {
    if (level === NAV_LEVELS.APP) {
      setAppSidebarVisible(visible);
    } else if (level === NAV_LEVELS.WORKSPACE) {
      setWorkspaceSidebarVisible(visible);
    }
  };
  
  // Check if a sidebar should be visible
  const isSidebarVisible = (level) => {
    if (level === NAV_LEVELS.APP) {
      return appSidebarVisible;
    } else if (level === NAV_LEVELS.WORKSPACE) {
      return workspaceSidebarVisible;
    }
    return false;
  };

  const contextValue = {
    currentNavLevel,
    appSidebarVisible,
    workspaceSidebarVisible,
    isMobileView,
    toggleAppSidebar,
    toggleWorkspaceSidebar,
    setSidebarVisibility,
    isSidebarVisible,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to use the navigation context
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;
