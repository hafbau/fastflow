import logo from '@/assets/images/fastflow_logo.svg'
import logoDark from '@/assets/images/fastflow_logo.svg'

import { useSelector } from 'react-redux'

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
            <img
                style={{ objectFit: 'contain', height: '100%', maxHeight: 56,
                    minHeight: 32 }}
                src={customization.isDarkMode ? logoDark : logo}
                alt='Fastflow'
            />
        </div>
    )
}

export default Logo
