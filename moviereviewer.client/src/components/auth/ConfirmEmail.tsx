import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmEmail, checkAuthStatus } from '../../api/authApi';
import styles from './ConfirmEmail.module.css';

interface ConfirmEmailProps {
    onUserLoggedIn?: (userData: any) => void;
}

export const ConfirmEmail: React.FC<ConfirmEmailProps> = ({ onUserLoggedIn }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirming your email...');

    useEffect(() => {
        const confirmUserEmail = async () => {
            const userId = searchParams.get('userId');
            const token = searchParams.get('token');

            if (!userId || !token) {
                setStatus('error');
                setMessage('Invalid confirmation link. Please sign up again.');
                return;
            }

            try {
                const result = await confirmEmail(userId, token);

                setStatus('success');
                setMessage(result.message || 'Email confirmed successfully!');

                try {
                    const userData = await checkAuthStatus();
                    if (onUserLoggedIn) {
                        onUserLoggedIn({
                            nickname: userData.nickname,
                            userEmail: userData.userEmail
                        });
                    }
                } catch (authError) {
                    console.log('Auth check error:', authError);
                }

                setTimeout(() => {
                    navigate('/');
                }, 4000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'The confirmation link has expired. Your pending account has been removed so you can sign up again.');
            }
        };

        confirmUserEmail();
    }, [searchParams, navigate, onUserLoggedIn]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {status === 'loading' && (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <h1 className={styles.title}>Confirming Email</h1>
                        <p className={styles.message}>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>✓</div>
                        <h1 className={styles.title}>Email Confirmed!</h1>
                        <p className={styles.message}>{message}</p>
                        <p className={styles.redirectText}>Redirecting to home...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className={styles.errorState}>
                        <div className={styles.errorIcon}>✕</div>
                        <h1 className={styles.title}>Link Expired</h1>
                        <p className={styles.message}>{message}</p>
                        <button
                            className={styles.button}
                            onClick={() => navigate('/')}
                        >
                            Sign Up Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};