import { useEffect, useState, type DependencyList } from 'react';

/**
 * Runs an async loader when the dependencies change and tracks its result.
 * Results from a superseded run (or after unmount) are ignored.
 */
export function useLoad<T>(loader: () => Promise<T>, deps: DependencyList) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        loader()
            .then((result) => active && setData(result))
            .catch((err: Error) => active && setError(err.message))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, reloadKey]);

    return { data, setData, error, loading, reload: () => setReloadKey((k) => k + 1) };
}
