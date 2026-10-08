import { useEffect, useState } from 'react';
import { getReservations } from '../services/reservations';

export default function useReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        getReservations()
            .then((data) => {
                if (active) setReservations(data);
            })
            .catch((err) => {
                if (active) setError(err.message || 'Erro ao carregar as reservas.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    function removeReservation(id) {
        setReservations((current) => current.filter((reservation) => reservation.id !== id));
    }

    return { reservations, loading, error, removeReservation };
}
