import { useState } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
    value: number | null;
    /** When set, the stars are clickable in half-star steps. Clicking the current value clears it. */
    onChange?: (value: number | null) => void;
    size?: number;
}

export function StarRating({ value, onChange, size = 16 }: StarRatingProps) {
    const [hover, setHover] = useState(0);
    const shown = hover || value || 0;

    const pick = (rating: number) => onChange?.(rating === value ? null : rating);

    return (
        <div
            className={styles.row}
            style={{ fontSize: size }}
            onMouseLeave={() => setHover(0)}
            role={onChange ? 'radiogroup' : 'img'}
            aria-label={value ? `${value} out of 5 stars` : 'Not rated'}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = shown >= star ? '100%' : shown >= star - 0.5 ? '50%' : '0%';
                return (
                    <span key={star} className={styles.star}>
                        <span className={styles.base}>★</span>
                        <span className={styles.fill} style={{ width: fill }}>★</span>
                        {onChange && (
                            <>
                                <button
                                    type="button"
                                    className={styles.halfLeft}
                                    onMouseEnter={() => setHover(star - 0.5)}
                                    onClick={() => pick(star - 0.5)}
                                    aria-label={`${star - 0.5} stars`}
                                />
                                <button
                                    type="button"
                                    className={styles.halfRight}
                                    onMouseEnter={() => setHover(star)}
                                    onClick={() => pick(star)}
                                    aria-label={`${star} stars`}
                                />
                            </>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
