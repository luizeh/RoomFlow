<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectReservationRequest;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

// Painel admin: fila de solicitações. O admin aprova ou recusa o que os clientes pediram.
class ReservationReviewController extends Controller
{
    /**
     * Quantas solicitações estão esperando resposta (número do menu lateral do painel).
     */
    public function pendingCount()
    {
        return response()->json([
            'count' => Reservation::where('status', ReservationStatus::Pending)->count(),
        ]);
    }

    /**
     * Aprova a solicitação. As pendentes que batem com o mesmo horário são recusadas
     * automaticamente, e todos os envolvidos recebem e-mail.
     */
    public function approve(Request $request, Reservation $reservation)
    {
        Gate::authorize('review', $reservation);

        if ($reservation->hasApprovedConflict()) {
            throw ValidationException::withMessages([
                'reservation' => ['Já existe uma reserva aprovada nesse horário para esta sala.'],
            ]);
        }

        $autoRejected = $reservation->approve($request->user());

        $reservation->notifyOwner();
        $autoRejected->each->notifyOwner();

        return response()->json([
            'reservation' => $reservation->load(['user', 'room']),
            'auto_rejected' => $autoRejected->count(),
        ]);
    }

    /**
     * Recusa a solicitação (ou cancela uma já aprovada), com motivo opcional.
     */
    public function reject(RejectReservationRequest $request, Reservation $reservation)
    {
        Gate::authorize('review', $reservation);

        $reservation->reject($request->user(), $request->validated('reason'));
        $reservation->notifyOwner();

        return response()->json($reservation->load(['user', 'room']));
    }
}
