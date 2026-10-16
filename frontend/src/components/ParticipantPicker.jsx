import { useEffect, useState } from 'react';
import { searchUsers } from '../services/users';

// Campo para convidar pessoas para a reserva: busca por nome ou e-mail e mostra
// os escolhidos como "chips" removíveis.
// value: lista de usuários ({ id, name, email }); onChange recebe a lista nova.
export default function ParticipantPicker({ value, onChange }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);

    const term = query.trim();

    // Espera o usuário parar de digitar (300ms) antes de buscar
    useEffect(() => {
        if (term.length < 2) {
            setResults([]);
            setError(null);
            return;
        }

        let active = true;
        const timer = setTimeout(() => {
            setSearching(true);
            searchUsers(term)
                .then((data) => {
                    if (active) setResults(data);
                })
                .catch((err) => {
                    if (active) setError(err.message || 'Erro ao buscar usuários.');
                })
                .finally(() => {
                    if (active) setSearching(false);
                });
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [term]);

    const selectedIds = new Set(value.map((user) => user.id));
    const available = results.filter((user) => !selectedIds.has(user.id));

    function add(user) {
        onChange([...value, user]);
        setQuery('');
        setResults([]);
    }

    function remove(id) {
        onChange(value.filter((user) => user.id !== id));
    }

    return (
        <div className="participant-picker">
            <div className="input-icon">
                <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
                <input
                    id="participant_search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por nome ou e-mail"
                    autoComplete="off"
                />
            </div>

            {term.length >= 2 && (
                <ul className="participant-results" role="listbox" aria-label="Usuários encontrados">
                    {searching && <li className="participant-results-state">Buscando...</li>}
                    {!searching && error && <li className="participant-results-state field-error">{error}</li>}
                    {!searching && !error && available.length === 0 && (
                        <li className="participant-results-state">Nenhum usuário encontrado.</li>
                    )}
                    {!searching && !error && available.map((user) => (
                        <li key={user.id}>
                            <button type="button" className="participant-option" onClick={() => add(user)}>
                                <span className="participant-name">{user.name}</span>
                                <span className="participant-email">{user.email}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {value.length > 0 && (
                <ul className="participant-chips" aria-label="Convidados">
                    {value.map((user) => (
                        <li key={user.id} className="participant-chip">
                            <span>{user.name}</span>
                            <button type="button" onClick={() => remove(user.id)} aria-label={`Remover ${user.name}`}>
                                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
