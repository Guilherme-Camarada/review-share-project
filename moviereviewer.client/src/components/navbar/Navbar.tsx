import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { mediaPath, searchMedia, type MediaSummary } from '../../api/mediaApi';
import type { CurrentUser } from '../../api/authApi';
import { SearchResultItem } from './SearchResultItem';
import { FriendRequestsMenu } from './FriendRequestsMenu';
import { Avatar } from '../common/Avatar';
import { useClickOutside } from '../../utils/useClickOutside';

const SEARCH_DELAY_MS = 1300;

interface NavbarProps {
    currentUser: CurrentUser | null;
    onSignUp: () => void;
    onLogIn: () => void;
    onLogOut: () => void;
}

export function Navbar({ currentUser, onSignUp, onLogIn, onLogOut }: NavbarProps) {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.brand}>
                    <span className={styles.brandIcon}>P</span>
                    <span className={styles.brandText}>PostCredits</span>
                </Link>

                {currentUser && <MediaSearch />}

                <div className={styles.actionsGroup}>
                    {currentUser ? (
                        <>
                            <UserMenu nickname={currentUser.nickname} onLogOut={onLogOut} />
                            <FriendRequestsMenu />
                            <Link to="/list" className={styles.primaryButton}>My List</Link>
                        </>
                    ) : (
                        <>
                            <button type="button" className={styles.loginBtn} onClick={onLogIn}>LOG IN</button>
                            <button type="button" className={styles.signUpBtn} onClick={onSignUp}>SIGN UP</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

function MediaSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MediaSummary[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useClickOutside(containerRef, () => setOpen(false));

    // Searches once the user stops typing for a moment (or right away after Enter).
    useEffect(() => {
        const term = query.trim();
        if (!term) return;

        let active = true;
        const timer = setTimeout(() => {
            searchMedia(term)
                .then((found) => active && setResults(found))
                .catch(() => active && setResults([]))
                .finally(() => active && setIsSearching(false));
        }, submitted ? 0 : SEARCH_DELAY_MS);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query, submitted]);

    const select = (item: MediaSummary) => {
        setOpen(false);
        setQuery('');
        navigate(mediaPath(item.mediaType, item.id));
    };

    return (
        <div className={styles.searchContainer} ref={containerRef}>
            <form
                className={styles.searchWrapper}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!query.trim()) return;
                    setIsSearching(true);
                    setSubmitted((n) => n + 1);
                }}
            >
                <span className={styles.searchIcon}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </span>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                        const hasTerm = e.target.value.trim() !== '';
                        setQuery(e.target.value);
                        setSubmitted(0);
                        setIsSearching(hasTerm);
                        setOpen(hasTerm);
                    }}
                    onFocus={() => query.trim() && setOpen(true)}
                    placeholder="Search movies and series..."
                    className={styles.searchInput}
                />
            </form>

            {open && query.trim() && (
                <div className={styles.resultsDropdown}>
                    {isSearching ? (
                        <div className={styles.searchStatus}>Searching...</div>
                    ) : results.length > 0 ? (
                        <ul className={styles.resultsList}>
                            {results.slice(0, 20).map((item) => (
                                <SearchResultItem key={`${item.mediaType}-${item.id}`} item={item} onSelect={select} />
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.searchStatus}>No results found.</div>
                    )}
                </div>
            )}
        </div>
    );
}

function UserMenu({ nickname, onLogOut }: { nickname: string; onLogOut: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    return (
        <div className={styles.userMenuWrapper} ref={ref}>
            <button
                type="button"
                className={styles.userMenuButton}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
            >
                <Avatar name={nickname} size={24} />
                <span className={styles.userMenuText}>{nickname}</span>
                <span className={`${styles.userMenuCaret} ${open ? styles.userMenuCaretOpen : ''}`}>▾</span>
            </button>

            {open && (
                <div className={styles.dropdownMenu}>
                    <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                            setOpen(false);
                            onLogOut();
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}
