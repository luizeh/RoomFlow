<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

// Depende do RoomSeeder: usa as salas que ele cria.
class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        // Usuário comum para testes manuais (login: john@example.com / password).
        // firstOrCreate: se já existir, não mexe nele.
        $user = User::firstOrCreate(
            ['email' => 'john@example.com'],
            ['name' => 'John Doe', 'password' => 'password']
        );

        $alfa = Room::where('name', 'Sala Alfa')->firstOrFail();
        $auditorio = Room::where('name', 'Auditório Principal')->firstOrFail();

        Reservation::updateOrCreate(
            ['user_id' => $user->id, 'room_id' => $alfa->id],
            [
                'start_at' => now()->addDay()->setTime(9, 0),
                'end_at' => now()->addDay()->setTime(10, 0),
            ]
        );

        Reservation::updateOrCreate(
            ['user_id' => $user->id, 'room_id' => $auditorio->id],
            [
                'start_at' => now()->addDays(3)->setTime(14, 0),
                'end_at' => now()->addDays(3)->setTime(16, 0),
            ]
        );
    }
}
