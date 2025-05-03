import { useRoutes } from 'react-router-dom'

// routes
import MainRoutes from './MainRoutes'
import CanvasRoutes from './CanvasRoutes'
import ChatbotRoutes from './ChatbotRoutes'
import AdminRoutes from './AdminRoutes'
import AccessReviewRoutes from './AccessReviewRoutes'
import UserLifecycleRoutes from './UserLifecycleRoutes'
import PermissionRoutes from './PermissionRoutes'
import AuthRoutes from './AuthRoutes'
import config from '@/config'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    return useRoutes([
        MainRoutes,
        CanvasRoutes,
        ChatbotRoutes,
        AdminRoutes,
        AccessReviewRoutes,
        UserLifecycleRoutes,
        PermissionRoutes,
        AuthRoutes
    ], config.basename)
}
