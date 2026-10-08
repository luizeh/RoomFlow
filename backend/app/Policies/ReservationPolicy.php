<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    /**
     * Admin pode tudo. Retornar null deixa a decisão para o método específico.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->role === 'admin' ? true : null;
    }

    /**
     * Qualquer usuário logado pode listar as reservas.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Usuário comum só vê a própria reserva.
     */
    public function view(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }

    /**
     * Qualquer usuário logado pode criar uma reserva.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Usuário comum só edita a própria reserva.
     */
    public function update(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }

    /**
     * Usuário comum só exclui a própria reserva.
     */
    public function delete(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }
}
