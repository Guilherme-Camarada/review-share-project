export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    nickname: string;
    email: string;
    password: string;
}

export async function loginUser(payload: LoginPayload) {
    const response = await fetch('/api/UserAccounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Login failed. Please try again.');
    }

    return response.json();
}

export async function registerUser(payload: RegisterPayload) {
    const response = await fetch('/api/UserAccounts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        let errorMessage = 'Registration failed.';

        if (errorData?.message) {
            errorMessage = errorData.message;
        }

        else if (errorData?.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(' ');
        }

        else if (errorData?.errors && typeof errorData.errors === 'object') {
            const errorMessages = Object.values(errorData.errors)
                .flat()
                .filter(msg => typeof msg === 'string');
            if (errorMessages.length > 0) {
                errorMessage = errorMessages.join(' ');
            }
        }

        throw new Error(errorMessage);
    }

    return response.json();
}

export async function checkAuthStatus() {
    const response = await fetch('/api/UserAccounts/check-auth', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to check authentication status.');
    }

    return response.json();
}

export async function logoutUser() {
    const response = await fetch('/api/UserAccounts/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to log out.');
    }

    return response.json();
}

export async function confirmEmail(userId: string, token: string) {
    const response = await fetch(`/api/UserAccounts/confirm-email?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Email confirmation failed.');
    }

    return response.json();
}

export async function forgotPassword(email: string) {
    const response = await fetch('/api/UserAccounts/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to send password reset email.');
    }

    return response.json();
}

export async function resetPassword(email: string, token: string, newPassword: string) {
    const response = await fetch('/api/UserAccounts/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        let errorMessage = 'Password reset failed.';
        if (errorData?.message) {
            errorMessage = errorData.message;
        } else if (errorData?.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(' ');
        }

        throw new Error(errorMessage);
    }
    return response.json();
} 