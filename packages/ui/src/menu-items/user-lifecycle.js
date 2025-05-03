// assets
import { IconUserCircle, IconSettings, IconClipboardCheck, IconHistory } from '@tabler/icons-react';

// constant
// No need to import formatPath as it's not used

const icons = {
    IconUserCircle,
    IconSettings,
    IconClipboardCheck,
    IconHistory
};

// ==============================|| USER LIFECYCLE MENU ITEMS ||============================== //

const userLifecycle = {
    id: 'userLifecycle',
    title: 'User Lifecycle',
    type: 'group',
    icon: icons.IconUserCircle,
    children: [
        {
            id: 'provisioningRules',
            title: 'Provisioning Rules',
            type: 'item',
            url: '/user-lifecycle/rules',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'pendingApprovals',
            title: 'Pending Approvals',
            type: 'item',
            url: '/user-lifecycle/approvals',
            icon: icons.IconClipboardCheck,
            breadcrumbs: false
        },
        {
            id: 'userLifecycleHistory',
            title: 'User Lifecycle History',
            type: 'item',
            url: '/user-lifecycle/history',
            icon: icons.IconHistory,
            breadcrumbs: false
        }
    ]
};

export default userLifecycle;