import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'

// Admin components
const AdminRouteComponent = Loadable(lazy(() => import('@/views/admin/AdminRoutes')))

// ==============================|| ADMIN ROUTING ||============================== //

const AdminRoutes = {
    path: '/admin',
    element: <AdminRouteComponent />
}

export default AdminRoutes