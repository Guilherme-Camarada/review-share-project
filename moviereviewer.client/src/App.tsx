import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/navbar/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthModal } from './components/auth/AuthModal';
import { ConfirmEmail } from './components/auth/ConfirmEmail';
import { ResetPassword } from './components/auth/ResetPassword';
import { checkAuthStatus, logoutUser } from './api/authApi';

interface User {
    nickname: string;
    userEmail: string;
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
        <>
            <Routes>
                {/* Confirm Email Route */}
                <Route path="/confirm-email" element={<ConfirmEmail onUserLoggedIn={(userData) => {
                    const validatedUser: User = {
                        nickname: userData.nickname,
                        userEmail: userData.userEmail,
                    };
                    setCurrentUser(validatedUser);
                    localStorage.setItem('currentUser', JSON.stringify(validatedUser));
                }} />} />

                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Main App Routes */}
                <Route path="/*" element={
                    <>
                        <Navbar
                            currentUser={currentUser}
                            onSearch={(query) => console.log('Global search query:', query)}
                            onSignUp={() => openAuth('signup')}
                            onLogIn={() => openAuth('login')}
                            onLogOut={handleLogout}
                            onOpenRateModal={() => console.log('Open Rate/Log Modal')}
                        />

                        {!currentUser ? (
                            <LandingPage onOpenAuth={openAuth} />
                        ) : (
                            <Dashboard
                                user={currentUser}
                                onLogout={handleLogout}
                                onOpenRateLogModal={() => console.log('Open Rate/Log Modal')}
                            />
                        )}

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
                } />
            </Routes>
        </>
    );
}