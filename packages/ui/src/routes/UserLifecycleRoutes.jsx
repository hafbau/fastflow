import { lazy } from 'react'

// project imports
import MainLayout from '@/layout/MainLayout'
import Loadable from '@/ui-component/loading/Loadable'

// User Lifecycle Management pages
const ProvisioningRules = Loadable(lazy(() => import('@/views/user-lifecycle/ProvisioningRules.jsx')))
const PendingApprovals = Loadable(lazy(() => import('@/views/user-lifecycle/PendingApprovals.jsx')))
const UserLifecycleHistory = Loadable(lazy(() => import('@/views/user-lifecycle/UserLifecycleHistory.jsx')))

// ==============================|| USER LIFECYCLE ROUTES ||============================== //

const UserLifecycleRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/user-lifecycle/rules',
            element: <ProvisioningRules />
        },
        {
            path: '/user-lifecycle/approvals',
            element: <PendingApprovals />
        },
        {
            path: '/user-lifecycle/history',
            element: <UserLifecycleHistory />
        }
    ]
}

export default UserLifecycleRoutes