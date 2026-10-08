<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Reservation;
use App\Http\Requests\ReservationRequest;

// Reservas do usuário logado. A visão de todas as reservas fica no Admin\ReservationController.
class ReservationController extends Controller
{
    /**
     * Lista só as reservas do usuário logado.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Reservation::class);

        $reservations = $request->user()->reservations()->get();

        return response()->json($reservations);
    }

    /**
     * Cria uma reserva para o usuário logado.
     */
    public function store(ReservationRequest $request)
    {
        Gate::authorize('create', Reservation::class);

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $reservation = Reservation::create($data);

        return response()->json($reservation, 201);
    }

    /**
     * Mostra uma reserva (só se for do usuário).
     */
    public function show(Reservation $reservation)
    {
        Gate::authorize('view', $reservation);

        return response()->json($reservation);
    }

    /**
     * Atualiza uma reserva (só se for do usuário).
     */
    public function update(ReservationRequest $request, Reservation $reservation)
    {
        Gate::authorize('update', $reservation);

        $data = $request->validated();
        $reservation->update($data);

        return response()->json($reservation);
    }

    /**
     * Exclui uma reserva (só se for do usuário).
     */
    public function destroy(Reservation $reservation)
    {
        Gate::authorize('delete', $reservation);

        $reservation->delete();

        return response()->noContent();
    }
}
