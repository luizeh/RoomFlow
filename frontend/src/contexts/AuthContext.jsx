import { createContext, useContext, useEffect, useState } from 'react';

import {register as registerRequest, login as loginRequest, logout as logoutRequest, getUser,} from '../services/auth';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function refreshUser() {
        try {
            const userData = await getUser();

            setUser(userData);

        } catch (error) {
            if (error.status !== 401) {
                console.error(error);
            }
            setUser(null);
            
        } finally {
            setLoading(false);
        }
    }

    async function login(credentials) {
        const data = await loginRequest(credentials);
        setUser(data.user);

        return data.user;
    }

    async function register(userData) {
        const data = await registerRequest(userData);
        setUser(data.user);

        return data.user;
    }

    async function logout() {
        try {
            await logoutRequest();
        } finally {
            // Mesmo se a sessão já tiver expirado no servidor, o usuário sai da interface
            setUser(null);
        }
    }

    useEffect(() => {
        refreshUser();
    }, []);

    // Se QUALQUER chamada da API responder 401, a sessão acabou no servidor
    // (expirou ou foi encerrada). Limpando o user, ProtectedRoute/AdminRoute
    // redirecionam para /login sozinhos.
    useEffect(() => {
        const interceptor = api.interceptors.response.use(undefined, (error) => {
            if (error.status === 401) {
                setUser(null);
            }
            return Promise.reject(error);
        });

        return () => api.interceptors.response.eject(interceptor);
    }, []);

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout, refreshUser,}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}