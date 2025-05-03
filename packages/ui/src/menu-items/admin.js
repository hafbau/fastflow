// assets
import {
    IconDashboard,
    IconUsers,
    IconBuilding,
    IconLock,
    IconHistory
} from '@tabler/icons-react'

// constant
const icons = {
    IconDashboard,
    IconUsers,
    IconBuilding,
    IconLock,
    IconHistory
}

// ==============================|| ADMIN MENU ITEMS ||============================== //

const admin = {
    id: 'admin',
    title: 'Admin',
    type: 'group',
    children: [
        {
            id: 'admin-panel',
            title: 'Admin Panel',
            type: 'item',
            url: '/admin',
            icon: icons.IconDashboard,
            breadcrumbs: true
        }
    ]
}

export default admin