import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Reservations from './pages/Reservations';
import ReservationDetails from './pages/ReservationDetails';
import ReservationForm from './pages/ReservationForm';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import AdminRoomForm from './pages/admin/RoomForm';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';
import AdminReservations from './pages/admin/Reservations';
import AdminReservationForm from './pages/admin/ReservationForm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UserStatus from './components/UserStatus';

function App() {
    return (
        <>
        <UserStatus />
        <Routes>
            <Route path="/" element={<Navigate to="/rooms" replace />} />

            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />

            {/* Usuário logado */}
            <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
            <Route path="/reservations/new" element={<ProtectedRoute><ReservationForm /></ProtectedRoute>} />
            <Route path="/reservations/:id/edit" element={<ProtectedRoute><ReservationForm /></ProtectedRoute>} />
            <Route path="/reservations/:id" element={<ProtectedRoute><ReservationDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/rooms" element={<AdminRoute><AdminRooms /></AdminRoute>} />
            <Route path="/admin/rooms/new" element={<AdminRoute><AdminRoomForm /></AdminRoute>} />
            <Route path="/admin/rooms/:id/edit" element={<AdminRoute><AdminRoomForm /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users/:id/edit" element={<AdminRoute><AdminUserForm /></AdminRoute>} />
            <Route path="/admin/reservations" element={<AdminRoute><AdminReservations /></AdminRoute>} />
            <Route path="/admin/reservations/:id/edit" element={<AdminRoute><AdminReservationForm /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
        </Routes>
        </>
    );
}

export default App;
