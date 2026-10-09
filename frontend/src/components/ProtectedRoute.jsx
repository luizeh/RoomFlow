import { Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {

    const { user, loading } = useAuth();

    if (loading) {
        return <p className="state">Carregando...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;