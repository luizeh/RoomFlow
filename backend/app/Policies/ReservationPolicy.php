<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{

    public function before(User $user, string $ability): ?bool
    {
        return $user->role === 'admin' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reservation $reservation): bool
    {
         return $reservation->user_id === $user->id || $reservation->hasParticipant($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }

    public function share(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }

    public function leave(User $user, Reservation $reservation): bool
    {
        return $reservation->hasParticipant($user);
    }

    public function delete(User $user, Reservation $reservation): bool
    {
        return $reservation->user_id === $user->id;
    }
}
