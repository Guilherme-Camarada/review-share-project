import styles from './Avatar.module.css';

const COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#16a34a', '#e11d48', '#ca8a04', '#0d9488', '#4f46e5'];

/** Round initials badge; the colour is stable per name. */
export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
    const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

    return (
        <span
            className={styles.avatar}
            style={{ width: size, height: size, fontSize: size * 0.42, backgroundColor: COLORS[hash % COLORS.length] }}
            aria-hidden="true"
        >
            {name.trim().charAt(0).toUpperCase() || '?'}
        </span>
    );
}
