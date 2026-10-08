<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;

class RoomPolicy
{
    /**
     * Qualquer pessoa pode listar as salas, mesmo sem login (?User).
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Qualquer pessoa pode ver uma sala, mesmo sem login (?User).
     */
    public function view(?User $user, Room $room): bool
    {
        return true;
    }

    /**
     * Só admin cria sala.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Só admin edita sala.
     */
    public function update(User $user, Room $room): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Só admin exclui sala.
     */
    public function delete(User $user, Room $room): bool
    {
        return $user->role === 'admin';
    }
}
