import { useEffect, useState } from 'react';
import { getSiteSettings } from '../services/site';

// Conteúdo editável do site. Se a API falhar, settings fica null e a tela usa os textos padrão.
export default function useSiteSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        getSiteSettings()
            .then((data) => {
                if (active) setSettings(data);
            })
            .catch(() => {})
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    return { settings, loading };
}
