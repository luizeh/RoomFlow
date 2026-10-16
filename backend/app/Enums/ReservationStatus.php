<?php

namespace App\Enums;

// Situação de uma reserva. Cliente solicita (pending) e o admin aprova ou recusa.
// Só reservas aprovadas ocupam o horário da sala.
enum ReservationStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::Approved => 'Aprovada',
            self::Rejected => 'Recusada',
        };
    }
}
