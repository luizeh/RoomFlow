import { useEffect, useState } from 'react';
import { getReservation } from '../services/reservations';

export default function useReservation(id) {
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) {
            setReservation(null);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);
        setError(null);
        setNotFound(false);

        getReservation(id)
            .then((data) => {
                if (active) setReservation(data);
            })
            .catch((err) => {
                if (!active) return;
                if (err.status === 404) setNotFound(true);
                else setError(err.message || 'Erro ao carregar a reserva.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [id]);

    return { reservation, loading, error, notFound };
}
