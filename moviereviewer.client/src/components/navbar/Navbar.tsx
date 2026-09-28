import React, { useState } from 'react';
import styles from './Navbar.module.css';

export interface NavbarUser {
    nickname: string;
    userEmail: string;
}

interface NavbarProps {
    currentUser: NavbarUser | null;
    onSearch?: (query: string) => void;
    onSignUp?: () => void;
    onLogIn?: () => void;
    onLogOut?: () => void;
    onOpenRateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    currentUser,
    onSearch,
    onSignUp,
    onLogIn,
    onLogOut,
    onOpenRateModal,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>

                <div className={styles.brand}>
                    <div className={styles.brandIcon}>P</div>
                    <span className={styles.brandText}>PostCredits</span>
                </div>

                <form className={styles.searchWrapper} onSubmit={handleSearchSubmit}>
                    <span className={styles.searchIcon}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search movies, series, or users..."
                        className={styles.searchInput}
                    />
                </form>

                <div className={styles.actionsGroup}>
                    {currentUser ? (
                        <>
                            <div className={styles.userMenuWrapper}>
                                <button
                                    type="button"
                                    className={styles.userMenuButton}
                                    onClick={() => setUserMenuOpen((prev) => !prev)}
                                    aria-expanded={userMenuOpen}
                                >
                                    <span className={styles.userMenuText}>{currentUser.nickname}</span>
                                    <span className={`${styles.userMenuCaret} ${userMenuOpen ? styles.userMenuCaretOpen : ''}`}>
                                        ▾
                                    </span>
                                </button>

                                {userMenuOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <button
                                            type="button"
                                            className={styles.dropdownItem}
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                if (onLogOut) onLogOut();
                                            }}
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className={styles.rateLogButton}
                                onClick={onOpenRateModal}
                            >
                                <span>+</span> Rate / Log
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={styles.loginBtn}
                                onClick={onLogIn}
                            >
                                LOG IN
                            </button>
                            <button
                                type="button"
                                className={styles.signUpBtn}
                                onClick={onSignUp}
                            >
                                SIGN UP
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};