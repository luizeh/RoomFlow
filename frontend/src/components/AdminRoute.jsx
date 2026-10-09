import { Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

// Igual ao ProtectedRoute, mas além de logado o usuário precisa ser admin
function AdminRoute({ children }) {

    const { user, loading } = useAuth();

    if (loading) {
        return <p className="state">Carregando...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/rooms" replace />;
    }

    return children;
}

export default AdminRoute;
