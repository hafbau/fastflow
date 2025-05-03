import React, { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MainLayout from '@/layout/MainLayout'
import AuthGuard from '@/utils/route-guard/AuthGuard'

// permission management components
const FineGrainedPermissionsPage = Loadable(lazy(() => import('@/pages/FineGrainedPermissionsPage')))

// ==============================|| PERMISSION MANAGEMENT ROUTES ||============================== //

const PermissionRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/permissions/fine-grained',
            element: <FineGrainedPermissionsPage />
        },
        {
            path: '/permissions/fine-grained/user/:userId',
            element: <FineGrainedPermissionsPage />
        },
        {
            path: '/permissions/fine-grained/user/:userId/resource-type/:resourceType',
            element: <FineGrainedPermissionsPage />
        },
        {
            path: '/permissions/fine-grained/user/:userId/resource-type/:resourceType/resource/:resourceId',
            element: <FineGrainedPermissionsPage />
        }
    ]
}

export default PermissionRoutes