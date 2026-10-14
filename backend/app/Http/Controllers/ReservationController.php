<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Reservation;
use App\Http\Requests\ReservationRequest;

// Reservas do usuário logado: as que ele criou (host) e as que ele foi convidado (participante).
// A visão de todas as reservas fica no Admin\ReservationController.
class ReservationController extends Controller
{
    /**
     * Lista as reservas que o usuário criou e as que ele participa.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Reservation::class);

        $reservations = Reservation::visibleTo($request->user())
            ->with(['room:id,name', 'user:id,name'])
            ->orderBy('start_at')
            ->get();

        return response()->json($reservations);
    }

    /**
     * Cria uma reserva para o usuário logado, já com os participantes.
     */
    public function store(ReservationRequest $request)
    {
        Gate::authorize('create', Reservation::class);

        $reservation = $request->user()->reservations()->create($request->reservationData());
        $reservation->participants()->sync($request->participantIds() ?? []);

        return response()->json($reservation, 201);
    }

    /**
     * Mostra uma reserva (para o host e os participantes), com sala, host e participantes.
     */
    public function show(Request $request, Reservation $reservation)
    {
        Gate::authorize('view', $reservation);

        $reservation->load(['room:id,name,location', 'user:id,name', 'participants:id,name,email']);

        // Só quem pode compartilhar (host ou admin) recebe o token do link
        if ($request->user()->can('share', $reservation)) {
            $reservation->makeVisible('share_token');
        }

        return response()->json($reservation);
    }

    /**
     * Atualiza uma reserva (só o host). Os participantes só mudam se a lista vier na requisição.
     */
    public function update(ReservationRequest $request, Reservation $reservation)
    {
        Gate::authorize('update', $reservation);

        $reservation->update($request->reservationData());

        if ($request->participantIds() !== null) {
            $reservation->participants()->sync($request->participantIds());
        }

        return response()->json($reservation);
    }

    /**
     * Exclui uma reserva (só o host).
     */
    public function destroy(Reservation $reservation)
    {
        Gate::authorize('delete', $reservation);

        $reservation->delete();

        return response()->noContent();
    }

    /**
     * O participante sai da reserva: remove só ele, a reserva continua existindo.
     */
    public function leave(Request $request, Reservation $reservation)
    {
        Gate::authorize('leave', $reservation);

        $reservation->participants()->detach($request->user()->id);

        return response()->noContent();
    }
}
