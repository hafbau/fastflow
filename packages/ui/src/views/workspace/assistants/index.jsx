import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

// material-ui
import { Card, CardContent, Stack } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';

// project imports
import MainCard from '@/ui-component/cards/MainCard';
import ViewHeader from '@/layout/MainLayout/ViewHeader';
import { useAuth } from '@/contexts/AuthContext';

// icons
import { IconRobotFace, IconBrandOpenai, IconBrandAzure } from '@tabler/icons-react';

const cards = [
    {
        title: 'Custom Assistant',
        description: 'Create custom assistant using your choice of LLMs',
        icon: <IconRobotFace />,
        iconText: 'Custom',
        gradient: 'linear-gradient(135deg, #fff8e14e 0%, #ffcc802f 100%)',
        path: 'custom'
    },
    {
        title: 'OpenAI Assistant',
        description: 'Create assistant using OpenAI Assistant API',
        icon: <IconBrandOpenai />,
        iconText: 'OpenAI',
        gradient: 'linear-gradient(135deg, #c9ffd85f 0%, #a0f0b567 100%)',
        path: 'openai'
    },
    {
        title: 'Azure Assistant (Coming Soon)',
        description: 'Create assistant using Azure Assistant API',
        icon: <IconBrandAzure />,
        iconText: 'Azure',
        gradient: 'linear-gradient(135deg, #c4e1ff57 0%, #80b7ff5a 100%)'
    }
];

const StyledCard = styled(Card)(({ gradient }) => ({
    height: '300px',
    background: gradient,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    cursor: 'pointer'
}));

const FeatureIcon = styled('div')(() => ({
    display: 'inline-flex',
    padding: '4px 8px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
    marginBottom: '16px',
    '& svg': {
        width: '1.2rem',
        height: '1.2rem',
        marginRight: '8px'
    }
}));

const FeatureCards = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { workspaceId } = useParams();
    const customization = useSelector((state) => state.customization);

    const onCardClick = (index) => {
        const card = cards[index];
        if (card.path) {
            navigate(`/workspaces/${workspaceId}/assistants/${card.path}`);
        } else {
            alert('Under Development');
        }
    };

    return (
        <Stack
            spacing={3}
            direction='row'
            sx={{
                width: '100%',
                justifyContent: 'space-between'
            }}
        >
            {cards.map((card, index) => (
                <StyledCard
                    key={index}
                    gradient={card.gradient}
                    sx={{
                        flex: 1,
                        maxWidth: 'calc((100% - 2 * 16px) / 3)',
                        height: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: 1,
                        borderColor: theme.palette.grey[900] + 25,
                        borderRadius: 2,
                        color: customization.isDarkMode ? theme.palette.common.white : '#333333',
                        cursor: index === 2 ? 'not-allowed' : 'pointer',
                        opacity: index === 2 ? 0.6 : 1,
                        '&:hover': {
                            boxShadow: index === 2 ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                    onClick={() => index !== 2 && onCardClick(index)}
                >
                    <CardContent className='h-full relative z-10'>
                        <FeatureIcon>
                            {card.icon}
                            <span className='text-xs uppercase'>{card.iconText}</span>
                        </FeatureIcon>
                        <h2 className='text-2xl font-bold mb-2'>{card.title}</h2>
                        <p className='text-gray-600'>{card.description}</p>
                    </CardContent>
                </StyledCard>
            ))}
        </Stack>
    );
};

// ==============================|| WORKSPACE ASSISTANTS ||============================== //

const WorkspaceAssistants = () => {
    const { currentWorkspace } = useAuth();

    return (
        <MainCard>
            <Stack flexDirection='column' sx={{ gap: 3 }}>
                <ViewHeader title={`${currentWorkspace?.name || 'Workspace'} Assistants`} />
                <FeatureCards />
            </Stack>
        </MainCard>
    );
};

export default WorkspaceAssistants;
