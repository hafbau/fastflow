import { useSelector } from 'react-redux'

import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, StyledEngineProvider } from '@mui/material'

// routing
import Routes from '@/routes'

// defaultTheme
import themes from '@/themes'

// project imports
import NavigationScroll from '@/layout/NavigationScroll'
import AppRouter from './routes/AppRouter'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'

// ==============================|| APP ||============================== //

const App = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <AuthProvider>
                    <NavigationProvider>
                        <AppRouter />
                        {/* <NavigationScroll>
                            <Routes />
                        </NavigationScroll> */}
                    </NavigationProvider>
                </AuthProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export default App
