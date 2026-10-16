import { api } from './api';

// Conteúdo público do site (textos da landing e contatos do footer).
// A landing e o footer pedem ao mesmo tempo: guardamos a promessa para fazer uma requisição só.
let cached = null;

export function getSiteSettings() {
    if (!cached) {
        cached = api.get('/site-settings').catch((err) => {
            cached = null; // deixa tentar de novo na próxima vez
            throw err;
        });
    }
    return cached;
}

// Depois que o admin salva, a próxima leitura busca os dados novos
export function clearSiteSettingsCache() {
    cached = null;
}
