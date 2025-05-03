// assets
import { IconShieldLock, IconCalendarStats } from '@tabler/icons-react'

// constant
const icons = {
    IconShieldLock,
    IconCalendarStats
}

// ==============================|| ACCESS REVIEWS MENU ITEMS ||============================== //

const accessReviews = {
    id: 'access-reviews',
    title: 'Access Reviews',
    type: 'group',
    children: [
        {
            id: 'access-reviews-list',
            title: 'Access Reviews',
            type: 'item',
            url: '/access-reviews',
            icon: icons.IconShieldLock,
            breadcrumbs: false
        },
        {
            id: 'access-reviews-schedules',
            title: 'Review Schedules',
            type: 'item',
            url: '/access-reviews/schedules',
            icon: icons.IconCalendarStats,
            breadcrumbs: false
        }
    ]
}

export default accessReviews