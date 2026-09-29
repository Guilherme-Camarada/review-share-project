import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Outlet } from 'react-router-dom';
import { Navbar } from './components/navbar/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthModal } from './components/auth/AuthModal';
import { ConfirmEmail } from './components/auth/ConfirmEmail';
import { ResetPassword } from './components/auth/ResetPassword';
import { checkAuthStatus, logoutUser } from './api/authApi';
import type { TmdbMediaItem } from './api/movieApi';
import { MediaDetails } from './components/pages/MediaDetails';

interface User {
    nickname: string;
    userEmail: string;
}

function MediaDetailsRoute({ mediaType }: { mediaType: 'movie' | 'series' }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) return null;

    return (
        <MediaDetails
            key={`${mediaType}-${id}`}
            id={parseInt(id, 10)}
            mediaType={mediaType}
            onBack={() => navigate(-1)}
            onOpenRateModal={() => console.log('Open Rate/Log Modal')}
        />
    );
}

export default function App() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(() =>
        !localStorage.getItem('currentUser')
    );

    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        checkAuthStatus()
            .then((data: any) => {
                const validatedUser: User = {
                    nickname: data.nickname || 'User',
                    userEmail: data.userEmail || ''
                };
                setCurrentUser(validatedUser);
                localStorage.setItem('currentUser', JSON.stringify(validatedUser));
            })
            .catch((_error) => {
                setCurrentUser(null);
                localStorage.removeItem('currentUser');
            })
            .finally(() => {
                setIsCheckingAuth(false);
            });
    }, []);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout request failed on server:', error);
        } finally {
            // Instantly clear memory and stored session so the UI switches without page reload
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
            navigate('/');
        }
    };

    if (isCheckingAuth) return null;

    return (
        <Routes>
            {/* Rotas de Autenticação isoladas (sem Navbar) */}
            <Route
                path="/confirm-email"
                element={
                    <ConfirmEmail
                        onUserLoggedIn={(userData) => {
                            const validatedUser: User = {
                                nickname: userData.nickname,
                                userEmail: userData.userEmail,
                            };
                            setCurrentUser(validatedUser);
                            localStorage.setItem('currentUser', JSON.stringify(validatedUser));
                        }}
                    />
                }
            />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Layout Principal: Navbar e AuthModal partilhados entre as páginas */}
            <Route
                element={
                    <>
                        <Navbar
                            currentUser={currentUser}
                            onSelectItem={(item: TmdbMediaItem) => {
                                const isTv = item.media_type === 'tv' || (!item.title && !!item.name);
                                navigate(isTv ? `/series/${item.id}` : `/movie/${item.id}`);
                            }}
                            onSignUp={() => openAuth('signup')}
                            onLogIn={() => openAuth('login')}
                            onLogOut={handleLogout}
                            onOpenRateModal={() => console.log('Open Rate/Log Modal')}
                        />

                        {/* O conteúdo da rota ativa é renderizado aqui */}
                        <Outlet />

                        <AuthModal
                            isOpen={authModalOpen}
                            initialMode={authMode}
                            onClose={() => setAuthModalOpen(false)}
                            onSuccess={(user) => {
                                const validatedUser: User = {
                                    nickname: user.nickname || 'David',
                                    userEmail: user.userEmail || 'user@reelshare.com',
                                };
                                setCurrentUser(validatedUser);
                                localStorage.setItem('currentUser', JSON.stringify(validatedUser));
                            }}
                        />
                    </>
                }
            >
                {/* Página Inicial (Dashboard ou Landing) */}
                <Route
                    path="/"
                    element={
                        !currentUser ? (
                            <LandingPage onOpenAuth={openAuth} />
                        ) : (
                            <Dashboard
                                user={currentUser}
                                onLogout={handleLogout}
                                onOpenRateLogModal={() => console.log('Open Rate/Log Modal')}
                            />
                        )
                    }
                />

                {/* Rotas para os Detalhes da Media */}
                <Route path="/movie/:id" element={<MediaDetailsRoute mediaType="movie" />} />
                <Route path="/series/:id" element={<MediaDetailsRoute mediaType="series" />} />
                <Route path="/tv/:id" element={<MediaDetailsRoute mediaType="series" />} />
            </Route>
        </Routes>
    );
}