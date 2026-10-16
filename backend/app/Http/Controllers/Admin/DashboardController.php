<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;

// Painel admin: números gerais para a tela inicial do painel.
class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'rooms' => Room::count(),
            'users' => User::count(),
            'reservations' => Reservation::count(),
            'reservations_today' => Reservation::approved()->whereDate('start_at', today())->count(),
            'pending_reservations' => Reservation::where('status', ReservationStatus::Pending)->count(),
            'upcoming_reservations' => Reservation::approved()
                ->with(['user', 'room'])
                ->where('start_at', '>=', now())
                ->orderBy('start_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
