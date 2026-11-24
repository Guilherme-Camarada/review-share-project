import { useEffect, useRef, type RefObject } from 'react';

/** Calls onOutside when the user presses the mouse anywhere outside the referenced element. */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void) {
    const callback = useRef(onOutside);
    useEffect(() => {
        callback.current = onOutside;
    });

    useEffect(() => {
        const handle = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) callback.current();
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [ref]);
}
