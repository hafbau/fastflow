import React, { lazy } from 'react';
import Loadable from 'ui-component/loading/Loadable';

// Lazy load components
const ProvisioningRules = Loadable(lazy(() => import('./ProvisioningRules.jsx')));
const PendingApprovals = Loadable(lazy(() => import('./PendingApprovals.jsx')));
const UserLifecycleHistory = Loadable(lazy(() => import('./UserLifecycleHistory.jsx')));

export { ProvisioningRules, PendingApprovals, UserLifecycleHistory };