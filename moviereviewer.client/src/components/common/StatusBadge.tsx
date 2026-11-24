import { statusLabel, type WatchStatus } from '../../api/libraryApi';
import styles from './StatusBadge.module.css';

export function StatusBadge({ status }: { status: WatchStatus | null }) {
    if (!status) return null;
    return <span className={`${styles.badge} ${styles[status]}`}>{statusLabel(status)}</span>;
}
