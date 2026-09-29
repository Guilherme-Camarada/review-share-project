import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { fetchMediaByQuery, type TmdbMediaItem } from '../../api/movieApi';
import { SearchResultItem } from './SearchResultItem';

export interface NavbarUser {
    nickname: string;
    userEmail: string;
}

interface NavbarProps {
    currentUser: NavbarUser | null;
    onSignUp?: () => void;
    onLogIn?: () => void;
    onLogOut?: () => void;
    onOpenRateModal?: () => void;
    onSelectItem?: (item: TmdbMediaItem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    currentUser,
    onSignUp,
    onLogIn,
    onLogOut,
    onOpenRateModal,
    onSelectItem
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TmdbMediaItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    const handleBrandClick = () => {
        if (currentUser) {
            setSearchQuery('');
            setShowResults(false);
            navigate('/');
        }
    };

    // Close results dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const executeSearch = useCallback(async (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
            setSearchResults([]);
            setShowResults(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        try {
            const results = await fetchMediaByQuery(trimmed, 1);
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 1.3-second buffer: auto-fires search when the user stops typing
    useEffect(() => {
        const trimmed = searchQuery.trim();

        if (!trimmed) {
            setSearchResults([]);
            setShowResults(false);
            setIsSearching(false);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            executeSearch(trimmed);
        }, 1300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery, executeSearch]);

    // Optional shortcut: pressing Enter searches immediately without waiting for the buffer
    const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        executeSearch(searchQuery);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.brand} onClick={handleBrandClick}>
                    <div className={styles.brandIcon}>P</div>
                    <span className={styles.brandText}>PostCredits</span>
                </div>

                {/* Only render the search bar when user is authenticated */}
                {currentUser && (
                    <div className={styles.searchContainer} ref={searchRef}>
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
                                onFocus={() => {
                                    if (searchResults.length > 0 || searchQuery.trim()) {
                                        setShowResults(true);
                                    }
                                }}
                                placeholder="Search movies, series, or users..."
                                className={styles.searchInput}
                            />
                        </form>

                        {/* Dropdown with dynamic search results */}
                        {showResults && (
                            <div className={styles.resultsDropdown}>
                                {isSearching ? (
                                    <div className={styles.searchStatus}>Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <ul className={styles.resultsList}>
                                        {searchResults.slice(0, 20).map((item) => (
                                            <SearchResultItem
                                                key={`${item.media_type || 'item'}-${item.id}`}
                                                item={item}
                                                onSelect={(selected) => {
                                                    setShowResults(false);
                                                    setSearchQuery('');
                                                    if (onSelectItem) onSelectItem(selected);
                                                }}
                                            />
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={styles.searchStatus}>No results found.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

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
                            <button type="button" className={styles.loginBtn} onClick={onLogIn}>
                                LOG IN
                            </button>
                            <button type="button" className={styles.signUpBtn} onClick={onSignUp}>
                                SIGN UP
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};