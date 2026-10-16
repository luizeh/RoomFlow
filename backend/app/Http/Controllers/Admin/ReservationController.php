<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\ReservationStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use App\Http\Requests\ReservationRequest;
use App\Models\Reservation;

// Painel admin: todas as reservas, de todos os usuários.
class ReservationController extends Controller
{
    /**
     * Lista todas as reservas, com o usuário e a sala de cada uma.
     * Filtro opcional por situação: ?status=pending|approved|rejected
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Reservation::class);

        $request->validate([
            'status' => ['nullable', Rule::enum(ReservationStatus::class)],
        ]);

        $reservations = Reservation::with(['user', 'room', 'participants:id,name'])
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->orderBy('start_at')
            ->get();

        return response()->json($reservations);
    }

    /**
     * Mostra qualquer reserva, com usuário e sala.
     */
    public function show(Reservation $reservation)
    {
        Gate::authorize('view', $reservation);

        return response()->json($reservation->load(['user', 'room']));
    }

    /**
     * Atualiza qualquer reserva. O dono (user_id) não muda.
     */
    public function update(ReservationRequest $request, Reservation $reservation)
    {
        Gate::authorize('update', $reservation);

        $reservation->update($request->reservationData());

        return response()->json($reservation->load(['user', 'room']));
    }

    /**
     * Exclui qualquer reserva.
     */
    public function destroy(Reservation $reservation)
    {
        Gate::authorize('delete', $reservation);

        $reservation->delete();

        return response()->noContent();
    }
}
