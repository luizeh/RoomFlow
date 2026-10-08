<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
            'reservations_today' => Reservation::whereDate('start_at', today())->count(),
            'upcoming_reservations' => Reservation::with(['user', 'room'])
                ->where('start_at', '>=', now())
                ->orderBy('start_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
