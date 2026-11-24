import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from './components/navbar/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthModal } from './components/auth/AuthModal';
import { ConfirmEmail } from './components/auth/ConfirmEmail';
import { ResetPassword } from './components/auth/ResetPassword';
import { MediaDetails } from './components/pages/MediaDetails';
import { MyList } from './components/pages/MyList';
import { checkAuthStatus, logoutUser, type CurrentUser } from './api/authApi';
import type { MediaType } from './api/mediaApi';

const STORAGE_KEY = 'currentUser';

function loadStoredUser(): CurrentUser | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}

function MediaDetailsRoute({ mediaType }: { mediaType: MediaType }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const numericId = Number(id);

    if (!Number.isInteger(numericId)) return <Navigate to="/" replace />;

    return <MediaDetails key={`${mediaType}-${numericId}`} id={numericId} mediaType={mediaType} onBack={() => navigate(-1)} />;
}

export default function App() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadStoredUser);
    const [isCheckingAuth, setIsCheckingAuth] = useState(() => currentUser === null);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

    // Stable identity: ConfirmEmail's effect depends on it.
    const signIn = useCallback((user: CurrentUser) => {
        const validated = { nickname: user.nickname || 'User', userEmail: user.userEmail || '' };
        setCurrentUser(validated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    }, []);

    const clearUser = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // The cached user only avoids a flash of the landing page; the server has the final say.
    useEffect(() => {
        checkAuthStatus()
            .then(signIn)
            .catch(clearUser)
            .finally(() => setIsCheckingAuth(false));
    }, [signIn, clearUser]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout request failed on server:', error);
        } finally {
            clearUser();
            sessionStorage.clear();
            navigate('/');
        }
    };

    if (isCheckingAuth) return null;

    const requireUser = (element: ReactElement) => (currentUser ? element : <Navigate to="/" replace />);

    return (
        <Routes>
            {/* Auth pages have no navbar */}
            <Route path="/confirm-email" element={<ConfirmEmail onUserLoggedIn={signIn} />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
                element={
                    <>
                        <Navbar
                            currentUser={currentUser}
                            onSignUp={() => setAuthMode('signup')}
                            onLogIn={() => setAuthMode('login')}
                            onLogOut={handleLogout}
                        />
                        <Outlet />
                        <AuthModal
                            isOpen={authMode !== null}
                            initialMode={authMode ?? 'login'}
                            onClose={() => setAuthMode(null)}
                            onSuccess={signIn}
                        />
                    </>
                }
            >
                <Route
                    path="/"
                    element={currentUser ? <Dashboard nickname={currentUser.nickname} /> : <LandingPage onOpenAuth={setAuthMode} />}
                />
                <Route path="/list" element={requireUser(<MyList />)} />
                <Route path="/movie/:id" element={requireUser(<MediaDetailsRoute mediaType="movie" />)} />
                <Route path="/tv/:id" element={requireUser(<MediaDetailsRoute mediaType="tv" />)} />
                <Route path="/series/:id" element={requireUser(<MediaDetailsRoute mediaType="tv" />)} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
