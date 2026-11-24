/** "just now", "15m ago", "2h ago", "3d ago", then a short date. */
export function timeAgo(iso: string): string {
    // The API sends UTC timestamps without a zone suffix; treat them as UTC.
    const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
    if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d ago`;
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
