import React from 'react';
import styles from './ImagePlaceholder.module.css';

interface ImagePlaceholderProps {
    label: string;
    subLabel?: string;
    aspectRatio?: string;
    height?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
    label,
    subLabel = 'Screenshot placeholder - replace with final asset',
    aspectRatio = '16 / 10',
    height,
}) => {
    return (
        <div
            className={styles.container}
            style={{ aspectRatio: height ? undefined : aspectRatio, height }}
        >
            <div className={styles.iconWrapper}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            </div>
            <span className={styles.label}>{label}</span>
            <span className={styles.subLabel}>{subLabel}</span>
        </div>
    );
};