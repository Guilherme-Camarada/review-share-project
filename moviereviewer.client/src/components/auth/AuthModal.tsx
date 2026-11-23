import React, { useState, useEffect } from 'react';
import styles from './AuthModal.module.css';
import { loginUser, registerUser, forgotPassword } from '../../api/authApi';

interface AuthModalProps {
    isOpen: boolean;
    initialMode?: 'login' | 'signup';
    onClose: () => void;
    onSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    initialMode = 'login',
    onClose,
    onSuccess,
}) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotEmailSent, setForgotEmailSent] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setMode(initialMode);
        setError(null);
        setSuccessMessage(null);
        setForgotEmailSent(false);
        setForgotEmail('');
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        (async () => {
            try {
                if (mode === 'login') {
                    const result = await loginUser({ email, password });
                    setError(null);
                    setSuccessMessage(null);
                    onSuccess(result);
                    onClose();
                } else {
                    const result = await registerUser({
                        email,
                        nickname: username,
                        password,
                    });
                    setSuccessMessage(result.message || 'Please check your email to confirm your account.');
                    setUsername('');
                    setEmail('');
                    setPassword('');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        })();
    };

    const handleForgotPasswordSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await forgotPassword(forgotEmail);
            setForgotEmailSent(true);
            setForgotEmail('');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    ✕
                </button>

                <h2 className={styles.modalTitle}>Join or Sign In to PostCredits</h2>

                {/* Mode Tabs */}
                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                        onClick={() => {
                            setMode('login');
                            setError(null);
                            setSuccessMessage(null);
                            setForgotEmailSent(false);
                        }}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
                        onClick={() => {
                            setMode('signup');
                            setError(null);
                            setSuccessMessage(null);
                            setForgotEmailSent(false);
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                <div className={styles.welcomeHeading}>
                    {mode === 'login' ? 'Welcome back!' : mode === 'signup' ? 'Create your account' : 'Reset Password'}
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.formContainer}>
                    {mode === 'forgot' ? (
                        !forgotEmailSent ? (
                            /* Step 1: Forgot Password Input Form */
                            <form className={styles.form} onSubmit={handleForgotPasswordSubmit}>
                                <p className={styles.resetSubtitle}>
                                    Enter your registered email address, and we'll send you a link to reset your password.
                                </p>

                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Registered Email Address"
                                        className={styles.input}
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                        ) : (
                            /* Step 2: Forgot Password Success Indication */
                            <div className={styles.successContainer}>
                                <div className={styles.successIcon}>✓</div>
                                <h3 className={styles.successTitle}>Reset Link Sent</h3>
                                <p className={styles.successText}>
                                    We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                                </p>
                                <button
                                    type="button"
                                    className={styles.submitButton}
                                    onClick={() => {
                                        setForgotEmailSent(false);
                                        setMode('login');
                                        setError(null);
                                    }}
                                >
                                    Return to Login
                                </button>
                            </div>
                        )
                    ) : !successMessage ? (
                        /* Login & Sign Up Forms */
                        <form className={styles.form} onSubmit={handleSubmit}>
                            {/* 1. Username field (only in Sign Up mode) */}
                            {mode === 'signup' && (
                                <div key="field-username" className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Username"
                                        className={styles.input}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* 2. Email field (present in both Login and Sign Up) */}
                            <div key="field-email" className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    required
                                    placeholder={mode === 'login' ? 'Email' : 'Email Address'}
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* 3. Password field (present in both Login and Sign Up) */}
                            <div key="field-password" className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Password"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                            <line x1="2" x2="22" y1="2" y2="22" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {mode === 'login' && (
                                <button
                                    type="button"
                                    className={styles.forgotPassword}
                                    onClick={() => {
                                        setMode('forgot');
                                        setError(null);
                                        setSuccessMessage(null);
                                        setForgotEmailSent(false);
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            )}

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        /* Registration Success */
                        <div className={styles.successContainer}>
                            <div className={styles.successIcon}>✓</div>
                            <h3 className={styles.successTitle}>Registration Successful!</h3>
                            <p className={styles.successText}>{successMessage}</p>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={() => {
                                    setSuccessMessage(null);
                                    setMode('login');
                                    setError(null);
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Toggle */}
                {!successMessage && (
                    <p className={styles.footerText}>
                        {mode === 'forgot' ? (
                            <>
                                Not a member?{' '}
                                <button
                                    type="button"
                                    className={styles.toggleAuthMode}
                                    onClick={() => { setMode('signup'); setError(null); }}
                                >
                                    Sign Up
                                </button>
                                {' • '}
                                <button
                                    type="button"
                                    className={styles.toggleAuthMode}
                                    onClick={() => { setMode('login'); setError(null); }}
                                >
                                    Back to Log In
                                </button>
                            </>
                        ) : mode === 'login' ? (
                            <>
                                Not a member?{' '}
                                <button
                                    type="button"
                                    className={styles.toggleAuthMode}
                                    onClick={() => { setMode('signup'); setError(null); }}
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className={styles.toggleAuthMode}
                                    onClick={() => { setMode('login'); setError(null); }}
                                >
                                    Log In
                                </button>
                            </>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};