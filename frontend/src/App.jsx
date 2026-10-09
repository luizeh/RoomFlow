import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Rooms from './pages/rooms/Rooms';
import RoomDetails from './pages/rooms/RoomDetails';
import Reservations from './pages/reservations/Reservations';
import ReservationDetails from './pages/reservations/ReservationDetails';
import ReservationForm from './pages/reservations/ReservationForm';
import Profile from './pages/profile/Profile';
import NotFound from './pages/errors/NotFound';
import Dashboard from './pages/admin/dashboard/Dashboard';
import AdminRooms from './pages/admin/rooms/Rooms';
import AdminRoomForm from './pages/admin/rooms/RoomForm';
import AdminUsers from './pages/admin/users/Users';
import AdminUserForm from './pages/admin/users/UserForm';
import AdminReservations from './pages/admin/reservations/Reservations';
import AdminReservationForm from './pages/admin/reservations/ReservationForm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/rooms" replace />} />

            {/* Autenticação: telas em tela cheia, sem layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Site: todas as rotas usam o AppLayout */}
            <Route element={<AppLayout />}>
                {/* Públicas */}
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />

                {/* Usuário logado */}
                <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
                <Route path="/reservations/new" element={<ProtectedRoute><ReservationForm /></ProtectedRoute>} />
                <Route path="/reservations/:id/edit" element={<ProtectedRoute><ReservationForm /></ProtectedRoute>} />
                <Route path="/reservations/:id" element={<ProtectedRoute><ReservationDetails /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin: todas as rotas usam o AdminLayout */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="rooms/new" element={<AdminRoomForm />} />
                <Route path="rooms/:id/edit" element={<AdminRoomForm />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:id/edit" element={<AdminUserForm />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="reservations/:id/edit" element={<AdminReservationForm />} />
            </Route>
        </Routes>
    );
}

export default App;
