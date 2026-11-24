import { apiFetch } from './http';

export interface CurrentUser {
    nickname: string;
    userEmail: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    nickname: string;
    email: string;
    password: string;
}

interface MessageResponse {
    message: string;
}

export const loginUser = (payload: LoginPayload) =>
    apiFetch<CurrentUser & MessageResponse>('/api/UserAccounts/login', { method: 'POST', body: payload });

export const registerUser = (payload: RegisterPayload) =>
    apiFetch<MessageResponse>('/api/UserAccounts/register', { method: 'POST', body: payload });

export const checkAuthStatus = () => apiFetch<CurrentUser>('/api/UserAccounts/check-auth');

export const logoutUser = () => apiFetch<MessageResponse>('/api/UserAccounts/logout', { method: 'POST' });

export const confirmEmail = (userId: string, token: string) =>
    apiFetch<CurrentUser & MessageResponse>(
        `/api/UserAccounts/confirm-email?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`
    );

export const forgotPassword = (email: string) =>
    apiFetch<MessageResponse>('/api/UserAccounts/forgot-password', { method: 'POST', body: { email } });

export const resetPassword = (email: string, token: string, newPassword: string) =>
    apiFetch<MessageResponse>('/api/UserAccounts/reset-password', {
        method: 'POST',
        body: { email, token, newPassword },
    });
