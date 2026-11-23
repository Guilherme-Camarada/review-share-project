import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import styles from './ResetPassword.module.css';

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Calculate password strength score (0 to 4)
    const strengthScore = useMemo(() => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
        return score;
    }, [newPassword]);

    const isMatch = confirmPassword.length > 0 && confirmPassword === newPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token || !email) {
            setError('Invalid or expired reset link. Please request a new one.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, token, newPassword);

            // Clear any stale local user session so the landing page displays correctly
            localStorage.removeItem('currentUser');

            setIsSuccess(true);

            // Redirect to landing page after 4 seconds
            setTimeout(() => {
                navigate('/');
            }, 4000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {isSuccess ? (
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>✓</div>
                        <h1 className={styles.title}>Password Reset Successfully!</h1>
                        <p className={styles.subtitle}>
                            Your password has been updated. You will be redirected to the landing page in a few seconds so you can log in.
                        </p>
                        <p className={styles.redirectText}>Redirecting to home in 4 seconds...</p>
                        <button
                            type="button"
                            className={styles.submitButton}
                            onClick={() => navigate('/')}
                        >
                            Return to Home Now
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Key with Lock Graphic */}
                        <div className={styles.iconContainer}>
                            <svg
                                className={styles.keyIcon}
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M28 8C21.3726 8 16 13.3726 16 20C16 22.3925 16.7003 24.6212 17.9056 26.4951L8 36.4V42H13.6V39.2H16.4V36.4H19.2V33.6L21.5049 31.2944C23.3788 32.4997 25.6075 33.2 28 33.2C34.6274 33.2 40 27.8274 40 21.2C40 14.5726 34.6274 8 28 8Z"
                                    fill="#1d72fe"
                                />
                                <circle cx="28" cy="18" r="3.5" fill="#ffffff" />
                                <rect x="26" y="27" width="13" height="11" rx="2.5" fill="#155bd5" />
                                <path
                                    d="M29 27V23.5C29 21.567 30.567 20 32.5 20C34.433 20 36 21.567 36 23.5V27"
                                    stroke="#155bd5"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                <circle cx="32.5" cy="32.5" r="1.5" fill="#ffffff" />
                            </svg>
                        </div>

                        <h1 className={styles.title}>Create New Password</h1>
                        <p className={styles.subtitle}>
                            Your reset request has been verified. Please enter a strong, new password below to secure your account.
                        </p>

                        {error && <div className={styles.errorBanner}>{error}</div>}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* New Password Input */}
                            <div className={styles.inputWrapper}>
                                <input
                                    type="password"
                                    required
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            {/* Segmented Password Strength Meter */}
                            <div className={styles.strengthMeter}>
                                <div
                                    className={`${styles.strengthSegment} ${strengthScore >= 1 ? styles.segmentRed : ''
                                        }`}
                                />
                                <div
                                    className={`${styles.strengthSegment} ${strengthScore >= 2 ? styles.segmentOrange : ''
                                        }`}
                                />
                                <div
                                    className={`${styles.strengthSegment} ${strengthScore >= 3 ? styles.segmentYellow : ''
                                        }`}
                                />
                                <div
                                    className={`${styles.strengthSegment} ${strengthScore >= 4 ? styles.segmentGreen : ''
                                        }`}
                                />
                                <div
                                    className={`${styles.strengthSegment} ${strengthScore >= 4 && newPassword.length >= 10
                                            ? styles.segmentDarkGreen
                                            : ''
                                        }`}
                                />
                            </div>

                            <p className={styles.strengthHint}>
                                Strength: At least 8 characters, one number, and one symbol
                            </p>

                            {/* Confirm Password Input */}
                            <div className={styles.inputWrapper}>
                                <input
                                    type="password"
                                    required
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`${styles.input} ${isMatch ? styles.inputValid : ''}`}
                                />
                                {isMatch && (
                                    <svg
                                        className={styles.checkIcon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#16a34a"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save & Log In'}
                            </button>
                        </form>

                        <p className={styles.footerText}>
                            Not a member?{' '}
                            <button
                                type="button"
                                className={styles.linkButton}
                                onClick={() => navigate('/')}
                            >
                                Sign Up
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};