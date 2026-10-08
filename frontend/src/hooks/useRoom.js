import { useEffect, useState } from 'react';
import { getRoom } from '../services/rooms';

export default function useRoom(id) {
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) {
            setRoom(null);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);
        setError(null);
        setNotFound(false);

        getRoom(id)
            .then((data) => {
                if (active) setRoom(data);
            })
            .catch((err) => {
                if (!active) return;
                if (err.status === 404) setNotFound(true);
                else setError(err.message || 'Erro ao carregar a sala.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [id]);

    return { room, loading, error, notFound };
}
