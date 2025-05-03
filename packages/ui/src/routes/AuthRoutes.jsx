import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'
import GuestGuard from '@/utils/route-guard/GuestGuard'
import AuthGuard from '@/utils/route-guard/AuthGuard'

// authentication routing
const Login = Loadable(lazy(() => import('@/views/auth/Login')))
const Signup = Loadable(lazy(() => import('@/views/auth/Signup')))
const ResetPassword = Loadable(lazy(() => import('@/views/auth/ResetPassword')))
const AccountManagement = Loadable(lazy(() => import('@/views/auth/AccountManagement')))

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/auth/login',
            element: (
                <GuestGuard>
                    <Login />
                </GuestGuard>
            )
        },
        {
            path: '/auth/signup',
            element: (
                <GuestGuard>
                    <Signup />
                </GuestGuard>
            )
        },
        {
            path: '/auth/reset-password',
            element: (
                <GuestGuard>
                    <ResetPassword />
                </GuestGuard>
            )
        },
        {
            path: '/account',
            element: (
                <AuthGuard>
                    <AccountManagement />
                </AuthGuard>
            )
        }
    ]
}

export default AuthRoutes