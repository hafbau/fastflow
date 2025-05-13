// assets
import {
    IconUsersGroup,
    IconHierarchy,
    IconBuildingStore,
    IconKey,
    IconTool,
    IconLock,
    IconRobot,
    IconVariable,
    IconFiles,
    IconHistory,
    IconSettings,
    IconUsers
} from '@tabler/icons-react'

// constant
const icons = {
    IconUsersGroup,
    IconHierarchy,
    IconBuildingStore,
    IconKey,
    IconTool,
    IconLock,
    IconRobot,
    IconVariable,
    IconFiles,
    IconHistory,
    IconSettings,
    IconUsers
}

// ==============================|| WORKSPACE DASHBOARD MENU ITEMS ||============================== //

const workspaceDashboard = {
    id: 'workspace-dashboard',
    title: '',
    type: 'group',
    children: [
        {
            id: 'workspace-chatflows',
            title: 'Chatflows',
            type: 'item',
            url: '/workspaces/:workspaceId/chatflows',
            icon: icons.IconHierarchy,
            breadcrumbs: true
        },
        {
            id: 'workspace-agentflows',
            title: 'Agentflows',
            type: 'item',
            url: '/workspaces/:workspaceId/agentflows',
            icon: icons.IconUsersGroup,
            breadcrumbs: true,
            isBeta: true
        },
        {
            id: 'workspace-assistants',
            title: 'Assistants',
            type: 'item',
            url: '/workspaces/:workspaceId/assistants',
            icon: icons.IconRobot,
            breadcrumbs: true
        },
        {
            id: 'workspace-marketplaces',
            title: 'Marketplaces',
            type: 'item',
            url: '/workspaces/:workspaceId/marketplaces',
            icon: icons.IconBuildingStore,
            breadcrumbs: true
        },
        {
            id: 'workspace-tools',
            title: 'Tools',
            type: 'item',
            url: '/workspaces/:workspaceId/tools',
            icon: icons.IconTool,
            breadcrumbs: true
        },
        {
            id: 'workspace-credentials',
            title: 'Credentials',
            type: 'item',
            url: '/workspaces/:workspaceId/credentials',
            icon: icons.IconLock,
            breadcrumbs: true
        },
        {
            id: 'workspace-variables',
            title: 'Variables',
            type: 'item',
            url: '/workspaces/:workspaceId/variables',
            icon: icons.IconVariable,
            breadcrumbs: true
        },
        {
            id: 'workspace-apikey',
            title: 'API Keys',
            type: 'item',
            url: '/workspaces/:workspaceId/apikey',
            icon: icons.IconKey,
            breadcrumbs: true
        },
        {
            id: 'workspace-audit-logs',
            title: 'Audit Logs',
            type: 'item',
            url: '/workspaces/:workspaceId/audit-logs',
            icon: icons.IconHistory,
            breadcrumbs: true
        },
        {
            id: 'workspace-document-stores',
            title: 'Document Stores',
            type: 'item',
            url: '/workspaces/:workspaceId/document-stores',
            icon: icons.IconFiles,
            breadcrumbs: true
        },
        {
            id: 'workspace-members',
            title: 'Members',
            type: 'item',
            url: '/workspaces/:workspaceId/members',
            icon: icons.IconUsers,
            breadcrumbs: true
        },
        {
            id: 'workspace-settings',
            title: 'Settings',
            type: 'item',
            url: '/workspaces/:workspaceId/settings',
            icon: icons.IconSettings,
            breadcrumbs: true
        }
    ]
}

export default workspaceDashboard
