import React, { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'
import MainLayout from '@/layout/MainLayout'
import AuthGuard from '@/utils/route-guard/AuthGuard'

// access review components
const AccessReviewList = Loadable(lazy(() => import('@/views/access-reviews/AccessReviewList')))
const AccessReviewForm = Loadable(lazy(() => import('@/views/access-reviews/AccessReviewForm')))
const AccessReviewDetail = Loadable(lazy(() => import('@/views/access-reviews/AccessReviewDetail')))
const AccessReviewScheduleList = Loadable(lazy(() => import('@/views/access-reviews/AccessReviewScheduleList')))
const AccessReviewScheduleForm = Loadable(lazy(() => import('@/views/access-reviews/AccessReviewScheduleForm')))

// ==============================|| ACCESS REVIEW ROUTES ||============================== //

const AccessReviewRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/access-reviews',
            element: <AccessReviewList />
        },
        {
            path: '/access-reviews/create',
            element: <AccessReviewForm />
        },
        {
            path: '/access-reviews/edit/:id',
            element: <AccessReviewForm />
        },
        {
            path: '/access-reviews/view/:id',
            element: <AccessReviewDetail />
        },
        {
            path: '/access-reviews/schedules',
            element: <AccessReviewScheduleList />
        },
        {
            path: '/access-reviews/schedules/create',
            element: <AccessReviewScheduleForm />
        },
        {
            path: '/access-reviews/schedules/edit/:id',
            element: <AccessReviewScheduleForm />
        }
    ]
}

export default AccessReviewRoutes