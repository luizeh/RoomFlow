import { useEffect, useState } from 'react';
import { getRooms } from '../services/rooms';

export default function useRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        getRooms()
            .then((data) => {
                if (active) setRooms(data);
            })
            .catch((err) => {
                if (active) setError(err.message || 'Erro ao carregar as salas.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    function removeRoom(id) {
        setRooms((currentRooms) => currentRooms.filter((room) => room.id !== id));
    }

    return { rooms, loading, error, removeRoom };
}
